module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },

  extends: 'airbnb-base',

  env: {
    browser: true
  },

  rules: {
    'no-use-before-define': [2, 'nofunc'],
    'no-underscore-dangle': 0,
    'no-bitwise': ['error', { 'allow': ['~'] }],
    'no-param-reassign': 1,
  },

  settings: {
    'import/core-modules': ['ember', 'qunit', 'ember-qunit'],
  }
};
