import { defineConfig } from 'oxlint';

// Mirror of eslint-config-seek/src/react.ts.
//
// oxlint's `react` plugin includes the react-hooks rules, so the
// `react-hooks/*` rule names from eslint-config-seek map onto `react/*`:
//   react-hooks/rules-of-hooks  -> react/rules-of-hooks
//   react-hooks/exhaustive-deps -> react/exhaustive-deps
//
// oxc parity: eslint-config-seek extends `react.configs.flat.recommended` and
// `['jsx-runtime']`. oxlint has no direct equivalent of those preset objects;
// enabling the `react` plugin turns on its `correctness` rules by default,
// which approximates the recommended baseline. The jsx-runtime preset only
// disabled `react-in-jsx-scope` etc., which oxlint does not enable by default,
// so no explicit opt-out is required.
//
// oxc parity (DISCUSS): `@oxlint/migrate` expands `recommended` into ~13
// explicit `react/*` rules on top of the seek customisations below. Some are on
// by default here (verified: `react/jsx-no-duplicate-props` fires), but the
// overlap with oxlint's default `correctness` is partial and unverified per
// rule. Migrate's full recommended list: `jsx-key`, `jsx-no-comment-textnodes`,
// `jsx-no-duplicate-props`, `jsx-no-target-blank`, `jsx-no-undef`,
// `no-danger-with-children`, `no-direct-mutation-state`, `no-find-dom-node`,
// `no-is-mounted`, `no-render-return-value`, `no-string-refs`,
// `no-unescaped-entities`, `no-unknown-property`. See the headline note in
// shared.ts and decide whether to list them explicitly for parity.
export default defineConfig({
  plugins: ['react'],

  // eslint-config-seek sets `languageOptions.globals = globals.browser`.
  env: {
    browser: true,
  },

  // oxc parity: eslint-config-seek sets `settings.react.version = 'detect'`.
  // oxlint's react plugin only accepts a concrete semver string (e.g. "18.2")
  // and has no auto-detect option. Rather than pin a version, we omit the
  // setting and let oxlint use its default (latest) for version-specific rules.

  rules: {
    'react/prefer-es6-class': ['error', 'always'],
    'react/self-closing-comp': 'error',
    'react/jsx-pascal-case': 'error',
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/no-children-prop': 'error',
    'react/display-name': 'off',
    // oxc parity: `react/prop-types` is not implemented by oxlint (it targets
    // runtime prop-types, largely obsolete under TypeScript). It was OFF in
    // eslint-config-seek anyway, so dropping it changes nothing.
    'react/jsx-curly-brace-presence': [
      'error',
      { props: 'never', children: 'ignore', propElementValues: 'always' },
    ],
  },
});
