import React from 'react';
import { Dirent, readdirSync } from 'fs';
import { ipcRenderer } from 'electron';
import { basename, join } from 'path';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

interface DirStructure {
  path: string;
  type: 'directory' | 'file';
  name: string;
  child?: Array<DirStructure>;
  el?: HTMLElement | null;
}

export function getStructureRecursive(dir: string) {
  const structure: DirStructure = {
    path: dir,
    type: 'directory',
    name: basename(dir),
    child: [],
  };
  const files = readdirSync(dir, { withFileTypes: true });
  for (let i = 0; i < files.length; i += 1) {
    const f: Dirent = files[i];
    if (f.isDirectory()) {
      structure.child?.push(getStructureRecursive(join(dir, f.name)));
    } else {
      structure.child?.push({
        path: join(dir, f.name),
        type: 'file',
        name: f.name,
      });
    }
  }
  return structure;
}

export default class DirectoryPane extends React.Component {
  paneRef: HTMLElement | null = null;

  constructor(props: { dir: string; file: string }) {
    super(props);
    this.state = {
      dir: props.dir ?? '',
      items: null,
      file: props.file ?? '',
    };
    ipcRenderer.on('dirOpen', (_event, dir: string) => {
      if (dir) {
        this.setState({ dir });
        this.getStructure(dir);
      }
    });
    ipcRenderer.on('fileActive', (_event, f: string) => {
      this.setState({ file: f });
    })
  }

  getTsxRecursive(dir: DirStructure, nest = 0) {
    return (
      <ol className="file-list">
        {dir.child
          ?.filter((child: DirStructure) => child.type === 'directory')
          .map((child: DirStructure) => {
            child.el = null;
            return (
              <li
                key={child.path}
                ref={(e) => (child.el = e)}
                className="collapsible-container fold"
                data-path={child.path}
              >
                <div
                  tabIndex={0}
                  className="collapsible-anchor"
                  onClick={() => {
                    if (child.el.classList.contains('fold')) {
                      child.el.classList.remove('fold');
                      child.el.classList.add('show');
                    } else {
                      child.el.classList.remove('show');
                      child.el.classList.add('fold');
                    }
                  }}
                  onKeyPress={() => {
                    if (child.el.classList.contains('fold')) {
                      child.el.classList.remove('fold');
                      child.el.classList.add('show');
                    } else {
                      child.el.classList.remove('show');
                      child.el.classList.add('fold');
                    }
                  }}>
                  {[...Array(nest)].map(() => {
                    return (
                      <span
                        style={{
                          borderLeft: '1px solid #fff6',
                          width: '17px',
                          display: 'inline-block',
                          whiteSpace: 'pre',
                        }}
                      >
                        {'  '}
                      </span>
                    );
                  })}
                  <span className="collapsible-logo">
                    <FontAwesomeIcon icon={faChevronRight} className="fold" />
                    <FontAwesomeIcon icon={faChevronDown} className="show" />
                  </span>
                  {child.name}
                </div>
                {this.getTsxRecursive(child, nest + 1)}
              </li>
            );
          })}
        {dir.child
          ?.filter((child: DirStructure) => child.type === 'file')
          .map((child: DirStructure) => {
            return (
              <li
                className={`file-item ${
                  this.state.file === child.path && 'active'
                }`}
                tabIndex={0}
                onClick={() => {
                  ipcRenderer.send('fileUse', child.path);
                }}
                onKeyPress={() => {
                  ipcRenderer.send('fileUse', child.path);
                }}
              >
                {[...Array(nest)].map(() => {
                  return (
                    <span
                      style={{
                        borderLeft: '1px solid #fff6',
                        width: '17px',
                        display: 'inline-block',
                        whiteSpace: 'pre',
                      }}
                    >
                      {'  '}
                    </span>
                  );
                })}
                {child.name}
              </li>
            );
          })}
      </ol>
    );
  }

  getStructure(dir: string) {
    const structure = getStructureRecursive(dir);
    this.setState({ items: structure });
  }

  resize(width: string, height: string) {
    if (this.paneRef) {
      this.paneRef.style.width = width;
      this.paneRef.style.height = height;
    }
  }

  render() {
    return (
      <div ref={(e) => (this.paneRef = e)} className="DirectoryPane">
        <div className="dir-container">
          {this.state.items && this.getTsxRecursive(this.state.items)}
        </div>
      </div>
    );
  }
}
