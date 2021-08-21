import React from 'react';

export default class SettingPane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="SettingPane">
        <span>this is settings pane</span>
      </div>
    );
  }
}
