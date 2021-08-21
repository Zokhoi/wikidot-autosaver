import React from 'react';
import './App.global.css';
import { ipcRenderer } from 'electron';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Sidebar from './Components/Sidebar';
import { VerticalRule } from './Components/Utils';
import TabbedEditorPane from './Components/TabbedEditorPane';
import HomePane from './Components/HomePane';
import DirectoryPane from './Components/DirectoryPane';
import SettingPane from './Components/SettingPane';

export default class App extends React.Component {
  tabs: string[];

  constructor(props) {
    super(props);
    this.tabs = props.tabs || [];
    this.state = {
      pane: '',
      side: {
        left: 'inactive',
      },
      footinfo: {
        cursor: '',
      },
    };
    ipcRenderer.on('dirInit', () => {
      this.setState({ pane: 'folder', side: { left: 'active' } });
    });
    ipcRenderer.on('dirOpen', () => {
      this.setState({ pane: 'folder', side: { left: 'active' } });
    })
    ipcRenderer.on('log', (_event, data) => {
      // eslint-disable-next-line no-console
      console.log(data);
    });
  }

  paneSwitcher(pane: string) {
    this.setState({
      pane: this.state.pane === pane ? '' : pane,
      side: { left: this.state.pane === pane ? 'inactive' : 'active' },
    });
  }

  footUpdater(info: Record<string, string>) {
    this.setState({ footinfo: info });
  }

  render() {
    return (
      <div className="layout-container vertical">
        {process.platform === 'win32' && <Header title="Shuen" />}
        <div
          className="layout-container horizontal"
          style={{
            height: `calc(100% - ${process.platform === 'win32' ? 60 : 30}px)`,
          }}
        >
          <Sidebar switcher={this.paneSwitcher.bind(this)} />
          <div className={`sidepane left ${this.state.side.left}`}>
            <div
              className={`side-tab directory-tab ${
                this.state.pane === 'folder' && 'active'
              }`}
            >
              <DirectoryPane />
            </div>
            <div
              className={`side-tab setting-tab ${
                this.state.pane === 'settings' && 'active'
              }`}
            >
              <SettingPane />
            </div>
          </div>
          <div className="mainpane">
            <div className="layout-container horizontal">
              <div className="pane editor-pane" style={{ flex: 1 }}>
                <TabbedEditorPane
                  tabs={this.tabs}
                  footer={this.footUpdater.bind(this)}
                />
              </div>
              <VerticalRule />
              <div className="pane view-pane" style={{ flex: 1 }}>
                View pane <br />
              </div>
            </div>
          </div>
        </div>
        <Footer cursor={this.state.footinfo.cursor} />
      </div>
    );
  }
}
