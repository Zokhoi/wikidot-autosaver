import React from 'react';
import { readFileSync } from 'fs';
import { basename } from 'path';
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
    this.setState({ title: basename(uri) });
    if (!uri) return <Editor doc="" extensions={[]} />;
    return (
      <div data-id={uri} className={`editor `}>
        <Editor doc={readFileSync(uri, 'utf8') || ''} extensions={[]} />
      </div>
    );
  }

  render() {
    return (
      <Editor />
    );
  }
}
