import React from 'react';
import { ipcRenderer } from 'electron';
import { readFileSync } from 'fs';
import { basename } from 'path';
import Editor from './Editor';

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
    ipcRenderer.on('fileOpen', (event, files: string[]) => {
      this.setState({ tabs: this.state.tabs.concat(files) });
      if (!this.state.activeTab) {
        this.setState({ activeTab: this.state.tabs[0] });
      }
    });
  }

  componentDidMount() {
    this.pane = document.querySelector('.content-container');
  }

  useTab(id: string) {
    this.setState({ activeTab: id });
  }

  createEditor(uri: string) {
    if (!uri) return <Editor doc="" fileUri={uri} extensions={[]} />;
    return (
      <div
        data-id={uri}
        className={`editor ${this.state.activeTab === uri && 'active'}`}
      >
        <Editor
          doc={readFileSync(uri, 'utf8') || ''}
          fileUri={uri}
          extensions={[]}
        />
      </div>
    );
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
