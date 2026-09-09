import { defineConfig } from 'oxlint';

import {
  allExtensions,
  allGlob,
  jsGlob,
  resolvePlugin,
  tsGlob,
} from './internal.ts';

export default defineConfig({
  plugins: ['eslint', 'import', 'typescript', 'node', 'unicorn'],

  categories: {
    correctness: 'off',
  },

  options: {
    typeAware: true,
  },

  jsPlugins: [
    { name: 'eslint-js', specifier: resolvePlugin('oxlint-plugin-eslint') },
  ],

  rules: {
    'no-console': 'error',
    'block-scoped-var': 'error',

    'dot-notation': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    'no-implicit-coercion': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-new': 'error',

    'eslint-js/no-octal-escape': 'error',
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-call': 'error',
    'no-void': 'error',
    radix: 'error',
    'vars-on-top': 'error',
    yoda: 'error',

    'no-label-var': 'error',

    'eslint-js/no-undef-init': 'error',

    'node/handle-callback-err': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    'unicorn/no-process-exit': 'error',

    'node/no-sync': 'error',

    'eslint-js/no-restricted-syntax': [
      'error',
      {
        selector: 'MethodDefinition[kind = "get"]',
        message:
          'Custom getters can cause confusion, particularly if they throw errors. Remove the `get` syntax to specify a regular method instead.',
      },
      {
        selector: 'MethodDefinition[kind = "set"]',
        message:
          'Custom setters can cause confusion, particularly if they throw errors. Remove the `set` syntax to specify a regular method instead.',
      },
      {
        selector: 'Property[kind = "get"]',
        message:
          'Custom getters can cause confusion, particularly if they throw errors. Remove the `get` syntax to specify a regular property instead.',
      },
      {
        selector: 'Property[kind = "set"]',
        message:
          'Custom setters can cause confusion, particularly if they throw errors. Remove the `set` syntax to specify a regular property instead.',
      },
    ],

    'new-cap': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',

    'eslint-js/spaced-comment': ['error', 'always'],
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',

    curly: ['error', 'all'],
  },

  overrides: [
    {
      files: [allGlob],
      env: {
        node: true,
        es2024: true,
      },
    },
    {
      files: [tsGlob],
      rules: {
        'typescript/adjacent-overload-signatures': 'error',
        'typescript/ban-tslint-comment': 'error',
        'typescript/class-literal-property-style': 'error',
        'typescript/consistent-generic-constructors': 'error',
        'typescript/consistent-indexed-object-style': 'error',
        'typescript/consistent-type-assertions': 'error',
        'typescript/no-array-constructor': 'error',
        'typescript/no-confusing-non-null-assertion': 'error',
        'typescript/no-duplicate-enum-values': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-extra-non-null-assertion': 'error',
        'typescript/no-misused-new': 'error',
        'typescript/no-namespace': 'error',
        'typescript/no-non-null-asserted-optional-chain': 'error',
        'typescript/no-require-imports': 'error',
        'typescript/no-this-alias': 'error',
        'typescript/no-unnecessary-type-constraint': 'error',
        'typescript/no-unsafe-declaration-merging': 'error',
        'typescript/no-unsafe-function-type': 'error',
        'typescript/no-unused-expressions': 'error',
        'typescript/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', ignoreRestSiblings: true },
        ],
        'typescript/no-wrapper-object-types': 'error',
        'typescript/prefer-as-const': 'error',
        'typescript/prefer-for-of': 'error',
        'typescript/prefer-function-type': 'error',
        'typescript/prefer-namespace-keyword': 'error',
        'typescript/triple-slash-reference': 'error',
        'prefer-rest-params': 'error',

        'typescript/array-type': ['error', { default: 'array-simple' }],
        'typescript/consistent-type-definitions': 'off',
        'typescript/no-non-null-assertion': 'off',
        'typescript/ban-ts-comment': 'off',
        'typescript/no-explicit-any': 'off',
        'typescript/explicit-function-return-type': 'off',
        'typescript/no-empty-function': 'off',
        'typescript/no-empty-interface': 'off',
        'typescript/no-inferrable-types': ['error', { ignoreParameters: true }],

        'default-case': 'off',
        'arrow-body-style': ['error', 'as-needed'],
        'no-shadow': 'off',
        'typescript/no-shadow': 'error',
        'typescript-js/naming-convention': [
          'error',
          {
            selector: 'typeLike',
            format: ['PascalCase'],
            leadingUnderscore: 'allow',
          },
          { selector: 'enum', format: null },
        ],

        'typescript/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
        'typescript/consistent-type-exports': [
          'error',
          { fixMixedExportsWithInlineTypeSpecifier: true },
        ],
        'typescript/no-import-type-side-effects': 'error',

        'import/no-duplicates': ['error', { preferInline: true }],
        'import/export': 'error',

        'import-zod/prefer-zod-namespace': 'error',
      },
      jsPlugins: [
        resolvePlugin('oxc-config-seek/plugins/typescript'),
        resolvePlugin('oxlint-plugin-import-zod'),
      ],
    },
    {
      files: [jsGlob],
      rules: {
        'no-undef': 'error',
        'no-use-before-define': ['error', { functions: false }],
        'no-unused-expressions': 'error',
        'no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', ignoreRestSiblings: true },
        ],
        'no-shadow': 'error',
        'default-case': 'error',

        'import/named': 'error',
        'import/namespace': 'error',
        'import/default': 'error',
        'import/export': 'error',
        'import/no-named-as-default': 'warn',
        'import/no-named-as-default-member': 'warn',

        'import/no-duplicates': 'error',
      },
    },
    {
      files: [`**/cypress/**/*.{${allExtensions}}`],
      jsPlugins: [resolvePlugin('eslint-plugin-cypress')],

      env: {
        browser: true,
        mocha: true,
      },
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        chai: 'readonly',
      },
      rules: {
        'cypress/no-assigning-return-values': 'error',
        'cypress/no-async-tests': 'error',
        'cypress/no-unnecessary-waiting': 'error',
        'cypress/unsafe-to-chain-command': 'error',
      },
    },
  ],
});
