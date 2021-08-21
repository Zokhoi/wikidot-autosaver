import React from 'react';
import { writeFileSync } from 'fs';
import {
  autocompletion,
  bracketMatching,
  closeBrackets,
  drawSelection,
  defaultKeymap,
  defaultTabBinding,
  EditorState,
  EditorView,
  Extension,
  highlightActiveLine,
  highlightSelectionMatches,
  highlightSpecialChars,
  history,
  indentOnInput,
  KeyBinding,
  keymap,
  rectangularSelection,
  ViewPlugin,
  ViewUpdate,
  lineNumbers,
  foldGutter,
  Command,
  css,
} from '../CodeMirror';

import CMDark from './CMDark';

class Editor extends React.Component {
  editorParentElRef: React.RefObject<HTMLDivElement>;

  fileUri: string;

  constructor(props: {} | Readonly<{}>) {
    super(props);
    this.editorParentElRef = React.createRef<HTMLDivElement>();
    this.fileUri = props.fileUri || '';

    const extensions = props.extensions || [];

    const View = new EditorView({
      state: EditorState.create({
        doc: props.doc,
        extensions: [
          highlightSpecialChars(),
          history(),
          drawSelection(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          highlightSelectionMatches(),
          autocompletion(),
          rectangularSelection(),
          highlightActiveLine(),
          EditorView.lineWrapping,
          lineNumbers(),
          foldGutter(),
          keymap.of([
            ...defaultKeymap,
            defaultTabBinding,
            {
              key: 'Ctrl-s',
              run: (view) => {
                if (this.fileUri) {
                  writeFileSync(
                    this.fileUri,
                    view.state.doc.sliceString(0),
                    'utf8'
                  );
                  return true;
                }
                return false;
              },
            },
          ]),
          CMDark,
          css(),
          extensions,
        ],
      }),
    });

    this.state = {
      view: View,
    };
  }

  componentDidMount() {
    const { view } = this.state;
    this.editorParentElRef.current?.appendChild(view.dom);
  }

  /**
   * Destroys the editor. Usage of the editor object after destruction is
   * obviously not recommended.
   */
  destroy() {
    const { view } = this.state;
    view.destroy();
  }

  render() {
    return <div className="cm-container" ref={this.editorParentElRef} />;
  }
}

export default Editor;
