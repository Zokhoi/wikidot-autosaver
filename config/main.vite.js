const { join, resolve } = require('path');
const { node } = require('./electron-dep-versions');
import commonjsExternals from 'vite-plugin-commonjs-externals';
import copy from 'rollup-plugin-copy';
const bundledWorker = require(resolve(__dirname, '../config/vite-plugin-bundled-worker'));

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
  resolve: {
    alias: [
      {
        find: '/@/',
        replacement: resolve(__dirname, './src/main') + '/',
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
  plugins: [
    commonjsExternals({ externals: require('./external-packages').default }),
    bundledWorker(),
  ],
  build: {
    target: `node${node}`,
    outDir: 'dist/source/main',
    assetsDir: '.',
    minify: process.env.MODE === 'development' ? false : 'terser',
    lib: {
      entry: 'src/main/index.ts',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: require('./external-packages').default,
      output: {
        entryFileNames: '[name].[format].js',
        chunkFileNames: '[name].[format].js',
        assetFileNames: '[name].[ext]',
      },
      plugins: [
        copy({
          targets: [
            { src: 'source/main/ftml.worker.7c11a202.js', dest: 'dist/source/main' },
          ],
          hook: 'writeBundle',
        }),
      ],
    },
    emptyOutDir: true,
  },
};
