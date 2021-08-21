import React from 'react';

export default class HomePane extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="HomePane">
        <span>this is home pane</span>
      </div>
    );
  }
}
