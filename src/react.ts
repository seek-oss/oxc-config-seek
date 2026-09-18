import { defineConfig } from 'oxlint';

import { allGlob, resolvePlugin } from './internal.ts';

export default defineConfig({
  plugins: ['react'],

  overrides: [
    {
      files: [allGlob],
      env: {
        browser: true,
      },
    },
  ],

  jsPlugins: [resolvePlugin('oxc-config-seek/plugins/react')],

  rules: {
    'react/jsx-key': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/require-render-return': 'error',

    'react-js/no-deprecated': 'error',

    'react/prefer-es6-class': ['error', 'always'],
    'react/self-closing-comp': 'error',
    'react/jsx-pascal-case': 'error',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/no-children-prop': 'error',
    'react/display-name': 'off',

    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'ignore', propElementValues: 'always' },
    ],
  },
});
