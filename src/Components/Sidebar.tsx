import React from 'react';
import { div } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFolderOpen, faEdit, faCog } from '@fortawesome/free-solid-svg-icons';
// import SCPIcon from '../../assets/scp-wiki';

class Sidebar extends React.Component {
  switcher: Function;

  constructor(props) {
    super(props);
    this.switcher = props.switcher;
    this.state = {
      pane: 'home',
      history: '/',
    };
  }

  render() {
    const { pane, history } = this.state;

    return (
      <div className="side-container">
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'home' && 'active'}`}
          onClick={() => {
            this.setState({ pane: 'home' });
            this.switcher('home');
          }}
        >
          <FontAwesomeIcon icon={faHome} />
        </a>
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'folder' && 'active'}`}
          onClick={() => {
            this.setState({ pane: 'folder' });
            this.switcher('folder');
          }}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </a>
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'edit' && 'active'}`}
          onClick={() => {
            this.setState({ pane: 'edit' });
            this.switcher('edit');
          }}
        >
          <FontAwesomeIcon icon={faEdit} />
        </a>
        <a
          role="menuitem"
          className={`side-item icon ${pane === 'settings' && 'active'}`}
          onClick={() => {
            this.setState({ pane: 'settings' });
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
