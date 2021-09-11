import React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import Editor from './Editor';

export default class EditorPane extends React.Component {
  constructor(props: { title?: string; uri?: Array<string> }) {
    super(props);
    this.state = {
      title: props.title || '',
      uri: props.uri || '',
    };
  }

  createEditor(uri: string) {
    this.setState({ title: path.basename(uri) });
    if (!uri) return <Editor doc="" extensions={[]} />;
    return (
      <div data-id={uri} className={`editor `}>
        <Editor doc={fs.readFileSync(uri, 'utf8') || ''} extensions={[]} />
      </div>
    );
  }

  render() {
    return <Editor />;
  }
}
