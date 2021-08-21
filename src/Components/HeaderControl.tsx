import React from 'react';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWindowMinimize,
  // faWindowMaximize,
  faSquare,
  faWindowRestore,
  faWindowClose,
} from '@fortawesome/free-regular-svg-icons';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';

class HeaderControl extends React.Component {
  minimize: HTMLElement;

  maximize: HTMLElement;

  close: HTMLElement;

  constructor(props: { title?: string; maximized?: boolean }) {
    super(props);
    this.state = {
      maximized: props.maximized || false,
    };
    ipcRenderer.on('startMaximized', () => {
      this.setState({ maximized: true });
    });
    ipcRenderer.on('WindowMaximize', () => {
      this.setState({ maximized: true });
    });
    ipcRenderer.on('WindowUnmaximize', () => {
      this.setState({ maximized: false });
    });
  }

  componentDidMount() {
    this.minimize.addEventListener('click', () => {
      ipcRenderer.send('WindowMinimize');
    });
    this.maximize.addEventListener('click', () => {
      if (this.maximize.classList.contains('window-maximize')) {
        ipcRenderer.send('WindowMaximize');
        this.setState({ maximized: true });
      } else {
        ipcRenderer.send('WindowUnmaximize');
        this.setState({ maximized: false });
      }
    });
    this.close.addEventListener('click', () => {
      ipcRenderer.send('WindowClose');
    });
  }

  render() {
    return (
      <div className="controls">
        <div
          ref={(e) => (this.minimize = e)}
          className="window-icon window-minimize"
        >
          <FontAwesomeIcon icon={faWindowMinimize} />
        </div>
        <div
          ref={(e) => (this.maximize = e)}
          className={`window-icon window-max-restore ${
            this.state.maximized ? 'window-restore' : 'window-maximize'
          }`}
        >
          {this.state.maximized ? (
            <FontAwesomeIcon icon={faWindowRestore} />
          ) : (
            <FontAwesomeIcon icon={faSquare} />
          )}
        </div>
        <div ref={(e) => (this.close = e)} className="window-icon window-close">
          <FontAwesomeIcon icon={faWindowClose} />
        </div>
      </div>
    );
  }
}

export default HeaderControl;
