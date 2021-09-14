/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
module.exports = {
  productName: 'Shuen',
  appId: 'com.zokhoi.shuen',
  directories: {
    output: 'dist/app',
    buildResources: 'assets',
    app: 'dist/source',
  },
  asarUnpack: [
    './node_modules/@wikijump/ftml-wasm',
  ],
  mac: {
    target: [
      'dmg',
    ],
    type: 'distribution',
    hardenedRuntime: true,
    gatekeeperAssess: false,
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220,
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications',
      },
    ],
  },
  win: {
    target: [
      'nsis',
    ],
    fileAssociations: [
      {
        ext: 'ftml',
        name: 'FTML File',
        role: 'Editor',
      },
    ],
  },
  nsis: {
    perMachine: false,
    oneClick: true,
  },
  linux: {
    target: [
      'AppImage',
      'deb',
      'pacman',
      'tar.xz',
    ],
    category: 'Development',
    synopsis: 'Edit offline and sync wikidot pages',
    icon: '512x512.png',
    executableName: 'shuen',
    mimeTypes: [
      'inode/directory',
    ],
    desktop: {
      Type: 'Application',
      Name: 'Shuen',
      Comment: 'Edit offline and sync wikidot pages',
      Terminal: false,
      Encoding: 'UTF-8',
      MimeType: 'inode/directory;text/x-wikidot;text/plain;',
    },
    fileAssociations: [
      {
        ext: 'ftml',
        mimeType: 'text/x-wikidot',
        name: 'FTML File',
        role: 'Editor',
      },
    ],
  },
};
