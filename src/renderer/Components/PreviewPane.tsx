import React from 'react';
import { ipcRenderer } from 'electron';

export default class PreviewPane extends React.Component {
  viewElRef = React.createRef<HTMLDivElement>();

  constructor(props: { source: string }) {
    super(props);

    ipcRenderer.on(
      'sourceUpdate',
      ((_event, html: string) => {
        if (this.viewElRef.current) {
          this.viewElRef.current.innerHTML = html;
        }
      }).bind(this),
    );
  }

  render() {
    return (<div className="preview-scroller">
      <div className="preview-content" ref={this.viewElRef} />
    </div>);
  }
}
