import React from 'react';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // faHome,
  faFolderOpen,
  // faEdit,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
// import SCPIcon from '../../assets/scp-wiki';

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pane: '',
    };
    ipcRenderer.on('dirInit', () => {
      this.setState({ pane: 'folder' });
    });
    ipcRenderer.on('dirOpen', () => {
      this.setState({ pane: 'folder' });
    });
  }

  switcher(pane: string) {
    this.setState({ pane: this.state.pane === pane ? '' : pane });
    this.props.switcher(pane);
  }

  render() {
    const { pane } = this.state;

    return (
      <div className="side-container">
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'folder' && 'active'}`}
          onClick={() => {
            this.switcher('folder');
          }}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </a>
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'settings' && 'active'}`}
          onClick={() => {
            this.switcher('settings');
          }}
        >
          <FontAwesomeIcon icon={faCog} />
        </a>
      </div>
    );
  }
}

export default Sidebar;
