const esbuild = require('esbuild');
const { resolve } = require('path');

const fileRegex = /\?bundled-worker$/;

const resolveInternal = (keypair) => {
  return {
    name: 'resolveInternal',
    setup(build) {
      for (const key in keypair) {
        build.onResolve({ filter: new RegExp(key) }, () => {
          return { path: resolve(keypair[key]) };
        });
      }
    },
  };
};

module.exports = function viteWorkerPlugin(cjs = false) {
  /** @type import("vite").Plugin */
  const plugin = {
    name: 'bundle-workers',

    async load(id) {
      if (fileRegex.test(id)) {
        // build the worker under IIFE so that it has no exports, no imports
        // should be 100% web-worker compatible
        const built = await esbuild.build({
          entryPoints: [id],
          bundle: true,
          minifySyntax: true,
          minifyIdentifiers: false,
          minifyWhitespace: true,
          plugins: [resolveInternal({
            // 'ftml-wasm/vendor/ftml': resolve(
            //   __dirname,
            //   '../package-wj/client/modules/ftml-wasm/vendor/ftml',
            // ),
            'ftml-wasm': resolve(
              __dirname,
              '../package-wj/client/modules/ftml-wasm/src/index.ts',
            ),
            'threads-worker-module/src/worker-lib': resolve(
              __dirname,
              '../package-wj/client/modules/threads-worker-module/src/worker-lib',
            ),
          })],
          treeShaking: true,
          outdir: './',
          outbase: './',
          write: false,
          define: {
            'window': 'globalThis',
            'import.meta.url': '""',
          },
          ...(cjs
            ? {
                format: 'cjs',
                platform: 'node',
                external: ['threads'],
              }
            : {
                format: 'iife',
                platform: 'browser',
              }),
        });

        let code, map;
        built.outputFiles.forEach(file => {
          if (file.path.endsWith('.map')) map = file.text;
          if (file.path.endsWith('.js')) code = file.text;
        });

        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: '' },
        };
      }
    },
  };

  return plugin;
};
