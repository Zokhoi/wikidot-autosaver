import React from 'react';

export default class Footer extends React.Component {
  constructor(props: { cursor: string }) {
    super(props);
  }

  render() {
    return (
      <div className="footer">
        <span>{this.props.cursor}</span>
      </div>
    );
  }
}
