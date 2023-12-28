module.exports = {
  root: true,
  env: {
    es6: true,
    node: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021
  },
  extends: ['eslint:recommended', '@electron-internal', '@electron-toolkit'],
  rules: {
    'space-before-function-paren': 'off',
    vendorPrefix: 'off'
  }
};
