import { defineConfig } from 'oxlint';

import { js as jsExtensions, ts as tsExtensions } from '../extensions.ts';
import shared from '../shared.ts';

const allExtensions = [...jsExtensions, ...tsExtensions].join(',');

export default defineConfig({
  extends: [shared],
  overrides: [
    {
      files: [
        `**/__tests__/**/*.{${allExtensions}}`,
        `**/*.{spec,test}.{${allExtensions}}`,
      ],
      plugins: ['vitest'],
      // oxc parity (minor): `@vitest/eslint-plugin`'s recommended sets no
      // globals, so `@oxlint/migrate` emits no env here. This `vitest: true`
      // env is an addition (valid oxlint env) to cover test globals; drop it if
      // strict parity with eslint-config-seek is preferred.
      env: {
        vitest: true,
      },
      rules: {
        // oxc parity: eslint-config-seek passes `{ fixable: false }` here.
        // oxlint's `vitest/no-focused-tests` takes no such option, so only the
        // severity is carried over. (`@oxlint/migrate` emits the option anyway,
        // but that output is INVALID for oxlint 1.72 - "This rule does not accept
        // configuration options", config fails to parse - so dropping it is
        // required, not optional. The port is correct here; migrate is wrong.)
        'vitest/no-focused-tests': 'error',
      },
      // oxc parity (DISCUSS): eslint-config-seek extends `@vitest/eslint-plugin`'s
      // `recommended`. oxlint has no named preset; enabling the `vitest` plugin
      // turns on its `correctness` rules, which approximates that set.
      // `@oxlint/migrate` instead expands `recommended` into 17 explicit
      // `vitest/*` rules (`no-disabled-tests` is `warn`, the rest `error`),
      // which the default `correctness` set here does not reproduce exactly.
      // See the headline note in shared.ts.
    },
  ],
});
