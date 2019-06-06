module.exports = {
  root: true,
  extends: 'airbnb',
  env: {
    'es6': true,
    'browser': true,
    'node': true,
  },
  parser: 'babel-eslint',
  plugins: ['babel'],
  parserOptions: {
    ecmaVersion: 7,
    ecmaFeatures: {
      experimentalDecorators: true,
    },
  },
  globals: {
    __CHANNEL__: false,
    __IS_APP__: false
  },
  settings: {
    'import/resolver': {
      'babel-module': {},
    }
  },
  'rules': {
    'class-methods-use-this': 'off',
    'import/no-extraneous-dependencies': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-for': 'warn',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'no-lonely-if': 'warn',
    'no-param-reassign': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-restricted-globals': 'off',
    'no-script-url': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'object-curly-newline': ['warn', { ObjectPattern: { consistent: true } }],
    'react/button-has-type': 'warn',
    'react/jsx-one-expression-per-line': 'off',
    'react/no-array-index-key': 'off',
    'react/no-did-mount-set-state': 'off',
    'react/no-multi-comp': 'off',
    'react/prefer-stateless-function': 'warn',
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'react/no-access-state-in-setstate': 'off',
  }
};
