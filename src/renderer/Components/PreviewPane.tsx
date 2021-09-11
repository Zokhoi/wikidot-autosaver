import React from 'react';
import ftml from 'ftml-wasm-worker';
import { ipcRenderer } from 'electron';

export default class PreviewPane extends React.Component {
  viewElRef = React.createRef<HTMLDivElement>();

  constructor(props: { source: string }) {
    super(props);

    ipcRenderer.on(
      'sourceUpdate',
      ((_event, source: string) => {
        ftml
          .renderHTML(source)
          .then(
            (({ html }: { html: string }) => {
              if (this.viewElRef.current) {
                this.viewElRef.current.innerHTML = html;
              }
            }).bind(this),
          )
          .catch(console.log);
      }).bind(this),
    );
  }

  render() {
    return <div className="PreviewPane" ref={this.viewElRef} />;
  }
}
