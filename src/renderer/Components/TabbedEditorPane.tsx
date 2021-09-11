import React from 'react';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import Editor from './Editor';

interface TabEditorInfo {
  id: string;
  name: string;
  uri: string;
  doc: string;
}

export default class TabbedEditorPane extends React.Component {
  pane: HTMLElement | null = null;

  editorContainer: React.RefObject<HTMLDivElement>;

  editors: Map<string, Editor> = new Map();

  state: {
    tabs: TabEditorInfo[];
    activeTab: string;
  };

  constructor(props: {
    tabs?: Array<string>;
    activeTab?: string;
    footer: (info: Record<string, string>) => void;
  }) {
    super(props);
    let initActive = '';
    if (props.tabs?.length) {
      initActive = props.activeTab ? props.activeTab : props.tabs[0];
    }
    this.state = {
      tabs:
        props.tabs?.map((f) => ({
          id: Math.random().toString(36).substring(4),
          uri: f,
          name: path.basename(f),
          doc: fs.readFileSync(f, 'utf8'),
        })) || [],
      activeTab: initActive || '',
    };
    this.editorContainer = React.createRef<HTMLDivElement>();
    ipcRenderer.on('fileOpen', (_event, files: string[], active?: string) => {
      this.addTabs(this.createEditors(files));
      if (active) {
        this.useTab(active);
      } else if (!this.state.activeTab && this.state.tabs.length) {
        this.useTab(this.state.tabs[0].id);
      }
    });
    ipcRenderer.on('tabClose', () => {
      this.closeTab(this.state.activeTab);
    });
    ipcRenderer.on('fileUse', (_event, file: string) => {
      const tab = this.getTabIdForFile(file);
      if (tab) this.useTab(tab);
      else {
        const created = this.createEditors([file]);
        this.addTabs(created);
        this.useTab(created[0].id);
      }
    });
  }

  componentDidMount() {
    this.pane = document.querySelector('.content-container');
  }

  getTabIdForFile(file: string): string | null {
    const { tabs } = this.state;
    const i = tabs.findIndex((t: TabEditorInfo) => t.uri === file);
    if (i === -1) return null;
    return tabs[i].id;
  }

  createEditors(files: Array<string>): Array<TabEditorInfo> {
    const tabInfo: TabEditorInfo[] = [];
    for (let i = 0; i < files.length; i += 1) {
      let tabid = Math.random().toString(36).substring(4);
      while (this.editors.has(tabid)) {
        tabid = Math.random().toString(36).substring(4);
      }
      if (files[i]) {
        tabInfo.push({
          id: tabid,
          uri: files[i],
          name: path.basename(files[i]),
          doc: fs.readFileSync(files[i], 'utf8'),
        });
      } else {
        tabInfo.push({
          id: tabid,
          uri: '',
          name: 'untitled',
          doc: '',
        });
      }
    }
    for (let i = 0; i < tabInfo.length; i += 1) {
      this.editors.set(tabInfo[i].id, this.createEditor(tabInfo[i]));
    }
    return tabInfo;
  }

  addTabs(tabs: Array<TabEditorInfo>) {
    this.setState({ tabs: this.state.tabs.concat(tabs) });
  }

  useTab(id: string) {
    const { activeTab, tabs } = this.state;
    this.setState({ activeTab: id });
    const i = tabs.findIndex((t: TabEditorInfo) => t.id === id);

    this.editorContainer.current?.setAttribute('data-id', id);
    this.editorContainer.current?.setAttribute(
      'data-uri',
      i === -1 ? '' : tabs[i].uri
    );
    this.editors.get(activeTab)?.unmount();
    this.editors.get(id)?.mount();
    ipcRenderer.invoke('fileActive', i === -1 ? '' : tabs[i].uri);
  }

  closeTab(tab: string | TabEditorInfo) {
    const { activeTab, tabs } = this.state;
    let i: number, j: number;
    if (typeof tab === 'string') {
      i = tabs.findIndex((t: TabEditorInfo) => t.id === tab);
    } else {
      i = tabs.indexOf(tab);
    }
    if (i === -1) return;
    if (i === 0) {
      j = 0;
    } else {
      j = i - 1;
    }
    const newTabs = tabs.slice(0, i).concat(tabs.slice(i + 1));
    const jid = newTabs.length ? newTabs[j].id : '';
    // console.log(tabs);
    // console.log(newTabs);
    this.setState({ tabs: newTabs });
    this.editors.get(activeTab)?.unmount();
    this.editors.delete(tabs[i].id);
    this.useTab(activeTab === tabs[i].id ? jid : activeTab);
  }

  createEditor(tab?: TabEditorInfo): Editor {
    const tabinfo: TabEditorInfo = tab || {
      id: Math.random().toString(36).substring(4),
      uri: '',
      name: 'untitled',
      doc: '',
    };
    return new Editor({
      doc: tabinfo.doc,
      fileUri: tabinfo.uri,
      footUpdater: this.props.footer,
      parentElRef: this.editorContainer,
    });
  }

  render() {
    const { tabs, activeTab } = this.state;
    return (
      <div className="content-container">
        <div className="tab-bar">
          <ul>
            {tabs.map((tab: TabEditorInfo) => (
              <li
                role="menuitem"
                key={tab.id}
                className={`tab-item ${
                  activeTab === tab.id && 'active'
                }`}
                data-id={tab.id}
                data-uri={tab.uri}
                onClick={() => this.useTab(tab.id)}
              >
                {tab.name}{' '}
                <a
                  type="button"
                  className="tab-close"
                  onClick={(e) => {
                    this.closeTab(tab)
                    e.stopPropagation();
                  }}
                >
                  x
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="editor-container" ref={this.editorContainer} />
      </div>
    );
  }
}
