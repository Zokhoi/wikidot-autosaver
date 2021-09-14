import React from 'react';
import { ipcRenderer } from 'electron';

export default class PreviewPane extends React.Component {
  viewElRef = React.createRef<HTMLDivElement>();

  constructor(props: { source: string }) {
    super(props);

    ipcRenderer.on(
      'sourceUpdate',
      ((_event, html: string, styles: string[]) => {
        if (this.viewElRef.current) {
          this.viewElRef.current.innerHTML = html;
          for (let i = 0; i < styles.length; i++) {
            this.viewElRef.current.innerHTML += `\n\n<style>\n${styles[i].replace(/\</g, '&lt;')}\n</style>`;
          }
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
