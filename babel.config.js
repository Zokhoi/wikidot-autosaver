/* eslint global-require: off, import/no-extraneous-dependencies: off */

const developmentEnvironments = ['development', 'test'];

const developmentPlugins = [require('@babel/plugin-transform-runtime')];

const productionPlugins = [
  require('babel-plugin-dev-expression'),

  // babel-preset-react-optimize
  require('@babel/plugin-transform-react-constant-elements'),
  require('@babel/plugin-transform-react-inline-elements'),
  require('babel-plugin-transform-react-remove-prop-types'),
];

module.exports = (api) => {
  // See docs about api at https://babeljs.io/docs/en/config-files#apicache

  const development = api.env(developmentEnvironments);

  return {
    presets: [
      // @babel/preset-env will automatically target our browserslist targets
      require('@babel/preset-env'),
      require('@babel/preset-typescript'),
      [require('@babel/preset-react'), { development }],
    ],
    plugins: [
      // Stage 0
      require('@babel/plugin-proposal-function-bind'),

      // Stage 1
      require('@babel/plugin-proposal-export-default-from'),
      require('@babel/plugin-proposal-logical-assignment-operators'),
      [require('@babel/plugin-proposal-optional-chaining'), { loose: false }],
      [
        require('@babel/plugin-proposal-pipeline-operator'),
        { proposal: 'minimal' },
      ],
      [
        require('@babel/plugin-proposal-nullish-coalescing-operator'),
        { loose: false },
      ],
      require('@babel/plugin-proposal-do-expressions'),

      // Stage 2
      [require('@babel/plugin-proposal-decorators'), { legacy: true }],
      require('@babel/plugin-proposal-function-sent'),
      require('@babel/plugin-proposal-export-namespace-from'),
      require('@babel/plugin-proposal-numeric-separator'),
      require('@babel/plugin-proposal-throw-expressions'),

      // Stage 3
      require('@babel/plugin-syntax-dynamic-import'),
      require('@babel/plugin-syntax-import-meta'),
      [require('@babel/plugin-proposal-class-properties'), { loose: false }],
      require('@babel/plugin-proposal-json-strings'),
      [
        require('babel-plugin-module-resolver'),
        {
          root: ['./'],
          alias: {
            'cm-lang-ftml': './package-wj/client/modules/cm-lang-ftml/',
            'cm-nspell': './package-wj/client/modules/cm-nspell/',
            'cm-tarnation': './package-wj/client/modules/cm-tarnation/',
            'ftml-wasm': './package-wj/client/modules/ftml-wasm/',
            'ftml-wasm-worker': './package-wj/client/modules/ftml-wasm-worker/',
            'threads-worker-module': './package-wj/client/modules/threads-worker-module/',
            'wj-codemirror': './package-wj/client/modules/wj-codemirror/',
            'wj-components': './package-wj/client/modules/wj-components/',
            'wj-css': './package-wj/client/modules/wj-css/',
            'wj-prism': './package-wj/client/modules/wj-prism/',
            'wj-state': './package-wj/client/modules/wj-state/',
            'wj-util': './package-wj/client/modules/wj-util/',
          },
        },
      ],

      ...(development ? developmentPlugins : productionPlugins),
    ],
  };
};
