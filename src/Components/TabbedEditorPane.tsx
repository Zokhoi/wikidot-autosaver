import React from 'react';
import { ipcRenderer } from 'electron';
import { readFileSync } from 'fs';
import { basename } from 'path';
import Editor from './Editor';

interface EditorTabInfo {
  id: string;
  name: string;
  uri: string;
}
export default class TabbedEditorPane extends React.Component {
  pane: HTMLElement | null = null;

  constructor(props: { tabs?: Array<string>; activeTab?: string }) {
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
        })) || [],
      activeTab: active || '',
    };
    ipcRenderer.on('fileOpen', (event, files: string[]) => {
      this.setState({
        tabs: this.state.tabs.concat(
          files.map((f) => ({
            id: Math.random().toString(36).substring(4),
            uri: f,
            name: basename(f),
          }))
        ),
      });
      if (!this.state.activeTab) {
        this.setState({ activeTab: this.state.tabs[0].id });
      }
    });
  }

  componentDidMount() {
    this.pane = document.querySelector('.content-container');
  }

  addTabs(tabs: Array<EditorTabInfo>) {
    this.setState({ tabs: this.state.tabs.concat(tabs) });
  }

  useTab(id: string) {
    this.setState({ activeTab: id });
  }

  createEditor(tab?: EditorTabInfo) {
    let doc = '';
    const tabinfo: EditorTabInfo = tab || {
      id: Math.random().toString(36).substring(4),
      uri: '',
      name: 'untitled',
    };
    if (tabinfo.uri) {
      doc = readFileSync(tabinfo.uri, 'utf8');
    }
    return (
      <div
        data-id={tabinfo.id}
        className={`editor ${this.state.activeTab === tabinfo.id && 'active'}`}
      >
        <Editor doc={doc} fileUri={tabinfo.uri} extensions={[]} />
      </div>
    );
  }

  render() {
    return (
      <div className="content-container">
        <div className="tab-bar">
          <ul>
            {this.state.tabs.map((tab: EditorTabInfo) => (
              <li
                role="menuitem"
                key={tab.id}
                className={`tab-item ${
                  this.state.activeTab === tab.id && 'active'
                }`}
                data-id={tab.id}
                onClick={() => this.useTab(tab.id)}
              >
                {tab.name}{' '}
                <a
                  type="button"
                  className="tab-close"
                  onClick={() => {
                    this.setState({
                      tabs: [].concat(
                        this.state.tabs.slice(0, this.state.tabs.indexOf(tab)),
                        this.state.tabs.slice(this.state.tabs.indexOf(tab) + 1)
                      ),
                      activeTab:
                        this.state.activeTab === tab.id
                          ? ''
                          : this.state.activeTab,
                    });
                  }}
                >
                  x
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="editor-container">
          {this.state.tabs.map((tab: EditorTabInfo) => this.createEditor(tab))}
        </div>
      </div>
    );
  }
}
