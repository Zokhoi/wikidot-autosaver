import React from 'react';
import './App.global.css';
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
      pane: 'home',
    };
  }

  paneSwitcher(pane: string) {
    this.setState({ pane: pane });
  }

  render() {
    return (
      <div className="layout-container vertical">
        <Header title="Shuen" />
        <div
          className="layout-container horizontal"
          style={{ height: 'calc(100% - 60px)' }}
        >
          <Sidebar switcher={this.paneSwitcher.bind(this)} />
          <div
            className={`mainpane home-tab ${
              this.state.pane === 'home' && 'active'
            }`}
          >
            <HomePane />
          </div>
          <div
            className={`mainpane directory-tab ${
              this.state.pane === 'folder' && 'active'
            }`}
          >
            <DirectoryPane />
          </div>
          <div
            className={`mainpane editor-tab ${
              this.state.pane === 'edit' && 'active'
            }`}
          >
            <div className="layout-container horizontal">
              <div className="pane editor-pane" style={{ flex: 1 }}>
                <TabbedEditorPane tabs={this.tabs} />
              </div>
              <VerticalRule />
              <div className="pane view-pane" style={{ flex: 1 }}>
                View pane <br />
              </div>
            </div>
          </div>
          <div
            className={`mainpane settings-tab ${
              this.state.pane === 'settings' && 'active'
            }`}
          >
            <SettingPane />
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
