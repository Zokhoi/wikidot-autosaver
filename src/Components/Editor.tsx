import React from 'react';
import { ipcRenderer } from 'electron';
import { writeFileSync } from 'fs';
import {
  autocompletion,
  bracketMatching,
  closeBrackets,
  drawSelection,
  defaultHighlightStyle,
  defaultKeymap,
  indentWithTab,
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
  Transaction,
  EditorSelection,
  SelectionRange,
  searchKeymap,
  countColumn,
} from '../CodeMirror';

import CMDark from './CMDark';

class Editor extends React.Component {
  editorParentElRef: React.RefObject<HTMLDivElement>;

  fileUri: string;

  footUpdater: (info: Record<string, string>) => void;

  constructor(
    props: Record<string, unknown> | Readonly<Record<string, unknown>>
  ) {
    super(props);
    this.footUpdater = props.footUpdater;
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
          // defaultHighlightStyle,
          autocompletion(),
          rectangularSelection(),
          highlightActiveLine(),
          EditorView.lineWrapping,
          lineNumbers(),
          foldGutter(),
          keymap.of([
            ...defaultKeymap,
            indentWithTab,
            ...searchKeymap,
            {
              key: 'Ctrl-s',
              run: (view) => {
                if (this.props.fileUri) {
                  writeFileSync(
                    this.props.fileUri,
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
      dispatch: ((tr: Transaction) => {
        const selection: EditorSelection =
          tr.selection ?? tr.startState.selection;
        let cursor = '';
        if (selection.ranges.length === 1) {
          cursor = `Ln ${tr.newDoc.lineAt(selection.main.from).number}, Col ${
            selection.main.to - tr.newDoc.lineAt(selection.main.from).from + 1
          }`;
        } else {
          cursor = `${
            selection.ranges.length
          } selections (${selection.ranges.reduce(
            (r: number, c: SelectionRange) => {
              return r + c.to - c.from;
            },
            0
          )} selected)`;
        }
        this.footUpdater({ cursor });
        View.update([tr]);
      }).bind(this),
    });

    this.state = {
      view: View,
    };
  }

  componentDidMount() {
    const { view } = this.state;
    this.editorParentElRef.current?.appendChild(view.dom);
  }

  componentWillUnmount() {
    // console.log(`${this.fileUri}: umounting ${this.props.fileUri}`);
    const { view } = this.state;
    // console.log(view.dom);
    this.editorParentElRef.current?.removeChild(view.dom);
    this.destroy();
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
