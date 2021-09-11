const { join } = require('path');
const { node } = require('./electron-dep-versions');
import commonjsExternals from 'vite-plugin-commonjs-externals';

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
module.exports = {
  resolve: {
    alias: {
      '/@/': join(process.cwd(), './src/main') + '/',
    },
  },
  plugins: [commonjsExternals({ externals: require('./external-packages').default })],
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
    },
    emptyOutDir: true,
  },
};
