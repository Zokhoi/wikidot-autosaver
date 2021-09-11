import React from 'react';
import HeaderControl from './HeaderControl';

class Header extends React.Component {
  maximized: boolean;

  constructor(props: { title?: string; maximized?: boolean }) {
    super(props);
    this.maximized = props.maximized || false;
  }

  render() {
    return (
      <div className="header">
        <div className="title">{this.props.title || ''}</div>
        <HeaderControl maximized={this.maximized} />
      </div>
    );
  }
}

export default Header;
