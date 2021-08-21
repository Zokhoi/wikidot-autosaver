import React from 'react';
import { ipcRenderer } from 'electron';
import { readFileSync } from 'fs';
import { basename } from 'path';
import Editor from './Editor';

interface EditorTabInfo {
  id: string;
  name: string;
  uri: string;
  doc: string;
}

export default class TabbedEditorPane extends React.Component {
  pane: HTMLElement | null = null;

  // eslint-disable-next-line react/state-in-constructor
  state: {
    tabs: EditorTabInfo[];
    activeTab: string;
  };

  constructor(props: {
    tabs?: Array<string>;
    activeTab?: string;
    footer: (info: Record<string, string>) => void;
  }) {
    super(props);
    let active = '';
    if (props.tabs?.length) {
      active = props.activeTab ? props.activeTab : props.tabs[0];
    }
    this.state = {
      tabs:
        props.tabs?.map((f) => ({
          id: Math.random().toString(36).substring(4),
          uri: f,
          name: basename(f),
          doc: readFileSync(f, 'utf8'),
        })) || [],
      activeTab: active || '',
    };
    ipcRenderer.on('fileOpen', (_event, files: string[], active?: string) => {
      this.setState({
        tabs: this.state.tabs.concat(
          files.map((f) => ({
            id: Math.random().toString(36).substring(4),
            uri: f,
            name: basename(f),
            doc: readFileSync(f, 'utf8'),
          }))
        ),
      });
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
        const tabid = Math.random().toString(36).substring(4);
        this.addTabs([
          {
            id: tabid,
            uri: file,
            name: basename(file),
            doc: readFileSync(file, 'utf8'),
          },
        ]);
        this.useTab(tabid);
      }
    });
  }

  componentDidMount() {
    this.pane = document.querySelector('.content-container');
  }

  getTabIdForFile(file: string): string | null {
    const { tabs } = this.state;
    const i = tabs.findIndex((t: EditorTabInfo) => t.uri === file);
    if (i === -1) return null;
    return tabs[i].id;
  }

  addTabs(tabs: Array<EditorTabInfo>) {
    this.setState({ tabs: this.state.tabs.concat(tabs) });
  }

  useTab(id: string) {
    this.setState({ activeTab: id });
    const i = this.state.tabs.findIndex((t: EditorTabInfo) => t.id === id);
    ipcRenderer.send('fileActive', i === -1 ? '' : this.state.tabs[i].uri)
  }

  closeTab(tab: string | EditorTabInfo) {
    const { activeTab, tabs } = this.state;
    let i: number, j: number;
    if (typeof tab === 'string') {
      i = tabs.findIndex((t: EditorTabInfo) => t.id === tab);
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
    this.useTab(activeTab === tabs[i].id ? jid : activeTab);
  }

  createEditor(tab?: EditorTabInfo) {
    const tabinfo: EditorTabInfo = tab || {
      id: Math.random().toString(36).substring(4),
      uri: '',
      name: 'untitled',
      doc: '',
    };
    return (
      <div
        data-id={tabinfo.id}
        data-uri={tabinfo.uri}
        className={`editor ${this.state.activeTab === tabinfo.id && 'active'}`}
      >
        <Editor
          doc={tabinfo.doc}
          fileUri={tabinfo.uri}
          footUpdater={this.props.footer}
        />
      </div>
    );
  }

  render() {
    const { tabs, activeTab } = this.state;
    return (
      <div className="content-container">
        <div className="tab-bar">
          <ul>
            {tabs.map((tab: EditorTabInfo) => (
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
        <div className="editor-container">
          {tabs.map((tab: EditorTabInfo) => this.createEditor(tab))}
        </div>
      </div>
    );
  }
}
