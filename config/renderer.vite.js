const { resolve, join } = require('path');
import reactRefresh from '@vitejs/plugin-react-refresh';
import commonjsExternals from 'vite-plugin-commonjs-externals';
const { chrome } = require('./electron-dep-versions');
const bundledWorker = require(resolve(__dirname, '../config/vite-plugin-bundled-worker'));
/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
  mode: process.env.MODE,
  base: './',
  root: join(process.cwd(), './src/renderer'),
  server: {
    port: 1212,
    fs: {
      strict: false,
      allow: ['./'],
    },
  },
  resolve: {
    alias: [
      {
        find: '/@/',
        replacement: resolve(__dirname, '../src/renderer') + '/',
      },
      {
        find: '@shuen',
        replacement: resolve(__dirname, '../package'),
      },
      {
        find: 'cm-tarnation',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/cm-tarnation',
        ),
      },
      {
        find: 'ftml-wasm',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/ftml-wasm',
        ),
      },
      {
        find: 'ftml-wasm-worker',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/ftml-wasm-worker',
        ),
      },
      {
        find: 'threads-worker-module',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/threads-worker-module',
        ),
      },
      {
        find: /(modules\/)?wj-codemirror\/cm/g,
        replacement: resolve(
          __dirname,
          '../src/renderer/CodeMirror',
        ),
      },
      {
        find: 'wj-codemirror',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/wj-codemirror',
        ),
      },
      {
        find: 'wj-util',
        replacement: resolve(
          __dirname,
          '../package-wj/client/modules/wj-util',
        ),
      },
    ],
  },
  plugins: [reactRefresh(), commonjsExternals({ externals: require('./external-packages').default }), bundledWorker()],
  build: {
    target: `chrome${chrome}`,
    polyfillDynamicImport: false,
    base: '',
    outDir: join(process.cwd(), 'dist/source/renderer'),
    assetsDir: '.',
    rollupOptions: {
      external: require('./external-packages').default,
    },
    emptyOutDir: true,
  },
};
