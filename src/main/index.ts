/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
  import 'core-js/stable';
  import 'regenerator-runtime/runtime';
  import * as path from 'path';
  import { app, BrowserWindow, shell, ipcMain } from 'electron';
  import { autoUpdater } from 'electron-updater';
  import log from 'electron-log';
  import Store from 'electron-store';
  import { Worker } from 'worker_threads';
  import ftmlRaw from './ftml.worker?raw';
  import electronLocalShortcut from 'electron-localshortcut';
  import * as fs from 'fs';
  import MenuBuilder from './menu';

  export default class AppUpdater {
    constructor() {
      log.transports.file.level = 'info';
      autoUpdater.logger = log;
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  let mainWindow: BrowserWindow | null = null;

  if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
  }

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' ||
    process.argv.includes('--debug') ||
    process.argv.includes('-d')
  ) {
    require('electron-debug')();
  }

  const schema: Record<string, unknown> = {
    windowBounds: {
      width: {
        type: 'number',
        default: 1024,
      },
      height: {
        type: 'number',
        default: 728,
      },
      x: {
        type: 'number',
        default: 0,
      },
      y: {
        type: 'number',
        default: 0,
      },
    },
    workspaces: {
      type: 'string',
      default: '',
    },
  };

  const store = new Store(schema);
  const prevBounds: Record<string, number> = store.get('windowBounds') as Record<string, number>;
  const workspaces: string = store.get('workspaces') as string;

  const appName = app.getName();

  const installExtensions = async () => {
    const installer = require('electron-devtools-installer');
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return installer
      .default(
        extensions.map((name) => installer[name]),
        forceDownload
      )
      .catch(console.log);
  };

  const createWindow = async () => {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      await installExtensions();
    }

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../assets');

    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
      show: false,
      width: prevBounds?.width ?? 1024,
      height: prevBounds?.height ?? 728,
      x: prevBounds?.x,
      y: prevBounds?.y,
      minHeight: 300,
      minWidth: 500,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        nodeIntegration: true,
      //  enableRemoteModule: true,
        contextIsolation: false,
      //  preload: path.resolve(__dirname, '../preload/index.ts'),
      },
      frame: process.platform !== 'win32',
    });

    mainWindow.loadURL(`http://localhost:1212/index.html`);

    // electronLocalShortcut.register(mainWindow, 'CmdOrCtrl+W', () => {
    //   mainWindow?.webContents.send('closeCurrentTab');
    // });

    // @TODO: Use 'ready-to-show' event
    //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
    mainWindow.webContents.on('did-finish-load', () => {
      if (!mainWindow) {
        throw new Error('"mainWindow" is not defined');
      }
      if (process.env.START_MINIMIZED) {
        mainWindow.minimize();
      } else if (process.env.START_MAXIMIZED ?? prevBounds?.maximized) {
        mainWindow.maximize();
        mainWindow.webContents.send('startMaximized');
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
      if (app.isPackaged && process.argv.length > 1) {
        const last = [...process.argv].pop()!;
        if (path.isAbsolute(last)) {
          const stat = fs.statSync(last);
          if (stat.isDirectory()) {
            mainWindow.webContents.send('dirOpen', last);
            mainWindow.webContents.send('dirInit');
          } else if (stat.isFile()) {
            mainWindow.webContents.send('fileOpen', [last]);
          }
        } else {
          mainWindow.webContents.send('dirInit');
          mainWindow.webContents.send('dirOpen', workspaces ?? '');
        }
      } else {
        mainWindow.webContents.send('dirInit');
        mainWindow.webContents.send('dirOpen', workspaces ?? '');
      }
    });

    ipcMain.handle('WindowMinimize', () => {
      mainWindow?.minimize();
    });

    ipcMain.handle('WindowMaximize', () => {
      mainWindow?.maximize();
    });

    ipcMain.handle('WindowUnmaximize', () => {
      mainWindow?.unmaximize();
    });

    ipcMain.handle('WindowClose', () => {
      mainWindow?.close();
    });

    // forward events between contents
    ipcMain.handle('fileUse', (_event, ...props) => {
      mainWindow?.webContents.send('fileUse', ...props);
    });
    ipcMain.handle('fileActive', (_event, ...props) => {
      mainWindow?.webContents.send('fileActive', ...props);
    });
    ipcMain.handle('sourceUpdate', (_event, source: string) => {
      const w = new Worker(ftmlRaw, {
        workerData: { ftmlSource: source },
        eval: true,
      });
      w.once(
        'message',
        ({ html, styles }: { html: string, styles: string[] }) => {
          mainWindow?.webContents.send('sourceUpdate', html, styles);
        },
      );
      w.once('error', console.log);
    });

    mainWindow.on('resize', () => {
      const bounds = mainWindow?.getBounds();
      if (!mainWindow?.isMaximized()) {
        store.set('windowBounds.width', bounds?.width);
        store.set('windowBounds.height', bounds?.height);
        store.set('windowBounds.x', bounds?.x);
        store.set('windowBounds.y', bounds?.y);
      }
    });

    mainWindow.on('maximize', () => {
      store.set('windowBounds.maximized', true);
      mainWindow?.webContents.send('WindowMaximize');
    });

    mainWindow.on('unmaximize', () => {
      store.set('windowBounds.maximized', false);
      mainWindow?.webContents.send('WindowUnmaximize');
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });

    // Remove this if your app does not use auto updates
    // eslint-disable-next-line
    new AppUpdater();
  };

  /**
  * Add event listeners...
  */

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.whenReady().then(createWindow).catch(console.log);

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
