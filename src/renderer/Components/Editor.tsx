import React from 'react';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
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
  historyKeymap,
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
  // TarnationLanguage,
} from '../CodeMirror';

import { confinement } from '../theme';
import CMDark from './CMDark';

class Editor {
  editorParentElRef: React.RefObject<HTMLDivElement>;

  fileUri: string;

  view: EditorView;

  mounted = false;

  footUpdater: (info: Record<string, string>) => void;

  constructor(props: {
    footUpdater: (info: Record<string, string>) => void;
    fileUri: string;
    extensions?: Array<Extension>;
    doc: string;
    parentElRef: React.RefObject<HTMLDivElement>;
  }) {
    this.footUpdater = props.footUpdater;
    this.editorParentElRef = props.parentElRef;
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
          confinement,
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
            ...historyKeymap,
            {
              key: 'Ctrl-s',
              run: (view) => {
                if (this.fileUri) {
                  fs.writeFile(
                    this.fileUri,
                    view.state.doc.sliceString(0),
                    'utf8',
                    _ => {},
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
        if (this.mounted) {
          this.footUpdater({ cursor });
          if (tr.docChanged) {
            ipcRenderer.invoke('sourceUpdate', tr.newDoc.toJSON().join('\n'));
          }
        }
        View.update([tr]);
      }).bind(this),
    });

    this.view = View;
  }

  mount(parentElRef?: React.RefObject<HTMLDivElement>) {
    if (parentElRef?.current) {
      this.editorParentElRef = parentElRef;
    }
    this.editorParentElRef.current?.appendChild(this.view.dom);
    ipcRenderer.invoke('sourceUpdate', this.view.state.doc.toJSON().join('\n'));
    this.mounted = true;
  }

  unmount() {
    if (this.mounted) {
      this.editorParentElRef.current?.removeChild(this.view.dom);
      this.mounted = false;
    }
  }

  /**
   * Destroys the editor. Usage of the editor object after destruction is
   * obviously not recommended.
   */
  destroy() {
    this.view.destroy();
  }

  render() {
    return <div className="cm-container" ref={this.editorParentElRef} />;
  }
}

export default Editor;
