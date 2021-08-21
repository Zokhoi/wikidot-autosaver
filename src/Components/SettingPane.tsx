import React from 'react';
import * as Handle from '../winHandler';

export default class SettingPane extends React.Component {
  fowHandle: HTMLInputElement;

  fHandle: HTMLInputElement;

  dHandle: HTMLInputElement;

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    Handle.fileHandler.isRegistered((i) => (this.fowHandle.checked = i));
    Handle.fileContextMenu.isRegistered((i) => (this.fHandle.checked = i));
    Handle.folderContextMenu.isRegistered((i) => (this.dHandle.checked = i));
  }

  setRegistration(option, shouldBeRegistered) {
    if (shouldBeRegistered) {
      return option.register(function () {});
    }
    return option.deregister(function () {});
  }

  render() {
    return (
      <div className="SettingPane">
        <label htmlFor="system.windows.file-handler">
          <input
            ref={(e) => (this.fowHandle = e)}
            id="system.windows.file-handler"
            onClick={() => {
              this.setRegistration(Handle.fileHandler, this.fowHandle.checked);
            }}
            type="checkbox"
          />
          <div className="setting-title">Register as file handler</div>
          <div className="setting-description">
            Show {Handle.appName} in the "Open with" application list for easy
            association with file types.
          </div>
        </label>
        <label htmlFor="system.windows.shell-menu-files">
          <input
            ref={(e) => (this.fHandle = e)}
            id="system.windows.shell-menu-files"
            onClick={() => {
              this.setRegistration(
                Handle.folderContextMenu,
                this.fHandle.checked
              );
              this.setRegistration(
                Handle.folderBackgroundContextMenu,
                this.fHandle.checked
              );
            }}
            type="checkbox"
          />
          <div className="setting-title">Show in file context menus</div>
          <div className="setting-description">
            Add "Open folder with {Handle.appName}" to the File Explorer context
            menu for files.
          </div>
        </label>
        <label htmlFor="system.windows.shell-menu-directory">
          <input
            ref={(e) => (this.dHandle = e)}
            id="system.windows.shell-menu-directory"
            onClick={() => {
              this.setRegistration(
                Handle.folderBackgroundContextMenu,
                this.dHandle.checked
              );
            }}
            type="checkbox"
          />
          <div className="setting-title">Show in folder context menus</div>
          <div className="setting-description">
            Add "Open folder with {Handle.appName}" to the File Explorer context
            menu for folders.
          </div>
        </label>
      </div>
    );
  }
}
