import React from 'react';
import { ipcRenderer } from 'electron';
import ftmlWorker from './ftml.worker.js?url&inline';

export default class PreviewPane extends React.Component {
  viewElRef = React.createRef<HTMLDivElement>();

  collapsibles = Array<HTMLDivElement>();

  ftml = new Worker(ftmlWorker, {
    type: 'module',
  });

  toggleCol = ((e: Event): void => {
    let col: HTMLDivElement | null = null;
    if (e.target.tagName=='A' && e.target.href=='javascript:;') {
      col = e.target.classList.contains('wj-collapsible-block-unfolded') || e.target.classList.contains('wj-collapsible-block-folded')
        ? e.target.parentNode.parentNode.parentNode
        : e.target.parentNode.parentNode;
    }
    if (col?.classList.contains('unfolded')) {
      col?.classList.replace('unfolded', 'folded');
    } else if (col?.classList.contains('folded')) {
      col?.classList.replace('folded', 'unfolded');
    } else {
      col?.classList.add('unfolded');
    }
    e.stopPropagation();
  }).bind(this);

  constructor(props: { source: string }) {
    super(props);

    this.ftml.addEventListener('message', (e => {
      const { html, styles }: { html: string, styles: string[] } = e.data;
      if (this.viewElRef.current) {

        this.clean();
        this.viewElRef.current.innerHTML = html;
        for (let i = 0; i < styles.length; i++) {
          this.viewElRef.current.innerHTML += `\n\n<style>\n${styles[i].replace(/\</g, '&lt;')}\n</style>`;
        }
        this.viewElRef.current.querySelectorAll('div.wj-collapsible-block').forEach((div: HTMLDivElement) => {
          div.addEventListener('click', this.toggleCol);
          div.classList.add('folded');
          this.collapsibles.push(div);
        });
      }
    }).bind(this));

    ipcRenderer.on(
      'sourceUpdate',
      ((_event, html: string | null) => {
        if (!html) return this.clean();
        if (this.viewElRef.current) {
          this.ftml.postMessage(html);
        }
      }).bind(this),
    );
  }

  clean() {
    if (this.viewElRef.current) {
      for (let i = 0; i < this.collapsibles.length; i++) {
        this.collapsibles[i].removeEventListener('click', this.toggleCol);
      }
      this.collapsibles = [];
      this.viewElRef.current.innerHTML = '';
    }
  }

  render() {
    return (<div className="preview-scroller">
      <div className="preview-content" ref={this.viewElRef} />
    </div>);
  }
}
