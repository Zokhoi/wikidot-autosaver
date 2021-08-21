import { EditorView } from '../CodeMirror';

const CMDark = EditorView.theme(
  {
    '&': {
      color: 'white',
      backgroundColor: 'transparent',
      height: '100%',
      width: '100%',
      margin: 0,
    },
    '.cm-content': {
      caretColor: 'transparent',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#999',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#777',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: '#ddd',
      border: 'none',
    },
    '.cm-lineNumbers': {
      minWidth: '35px',
    },
    '.cm-line': {
      borderTop: 'transparent 2px solid',
      borderBottom: 'transparent 2px solid',
    },
    '.cm-activeLine': {
      backgroundColor: 'transparent',
      borderTop: '#3f3f3faa 2px solid',
      borderBottom: '#3f3f3faa 2px solid',
    }
  },
  { dark: true }
);

export default CMDark;
