const moduleAliases = require('./tools/moduleAliases');

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '8.13' } }],
    '@babel/preset-react',
  ],
  plugins: [
    ['module-resolver', {
      root: moduleAliases.babel.root,
      alias: moduleAliases.babel.alias,
    }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-optional-chaining', { loose: true }],
    'add-module-exports',
  ],
};
