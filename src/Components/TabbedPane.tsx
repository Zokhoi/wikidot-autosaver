import React from 'react';
import { ipcRenderer } from 'electron';
import { readFileSync } from 'fs';
import { basename } from 'path';
import Editor from './Editor';

interface TabInfo {
  id: string;
  name: string;
}

export default class TabbedPane extends React.Component {
  pane: HTMLElement | null = null;

  constructor(props: { tabs?: Array<string>; activeTab?: string }) {
    super(props);
    let active = '';
    if (props.tabs?.length) {
      active = props.activeTab ? props.activeTab : props.tabs[0];
    }
    this.state = {
      tabs: props.tabs || [],
      activeTab: active || '',
    };
    ipcRenderer.on('tabClose', (event) => {
      this.closeTab(this.state.activeTab);
    });
  }

  componentDidMount() {
    this.pane = document.querySelector('.content-container');
  }

  useTab(id: string) {
    this.setState({ activeTab: id });
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
    this.setState({
      tabs: newTabs,
      activeTab: activeTab === tabs[i].id ? jid : activeTab,
    });
    ipcRenderer.send('fileDidClose', tabs[i]);
  }

  render() {
    return (
      <div className="content-container">
        <div className="tab-bar">
          <ul>
            {this.state.tabs.map((uri: string) => (
              <li
                role="menuitem"
                key={uri}
                className={`tab-item ${this.state.activeTab===uri && "active"}`}
                data-id={uri}
                onClick={() => this.setState({ activeTab: uri })}
              >
                {basename(uri)}{' '}
                <a
                  role="button"
                  className="tab-close"
                  onClick={() => {
                    this.setState({
                      tabs: [].concat(
                        this.state.tabs.slice(0, this.state.tabs.indexOf(uri)),
                        this.state.tabs.slice(this.state.tabs.indexOf(uri) + 1)
                      ),
                      activeTab:
                        this.state.activeTab === uri
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
          {this.state.tabs.map((uri: string) => this.createEditor(uri))}
        </div>
      </div>
    );
  }
}
