import React from 'react';
import { ipcRenderer } from 'electron';

export default class PreviewPane extends React.Component {
  viewElRef = React.createRef<HTMLDivElement>();

  collapsibles = Array<HTMLDivElement>();

  toggleCol = (e: Event): void => {
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
  };

  constructor(props: { source: string }) {
    super(props);

    ipcRenderer.on(
      'sourceUpdate',
      ((_event, html: string, styles: string[]) => {
        if (this.viewElRef.current) {
          for (let i = 0; i < this.collapsibles.length; i++) {
            this.collapsibles[i].removeEventListener('click', this.toggleCol);
          }
          this.collapsibles = [];
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
      }).bind(this),
    );
  }

  render() {
    return (<div className="preview-scroller">
      <div className="preview-content" ref={this.viewElRef} />
    </div>);
  }
}
