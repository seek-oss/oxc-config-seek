import { defineConfig } from 'oxlint';

import { js as jsExtensions, ts as tsExtensions } from './extensions.ts';
import shared from './shared.ts';

const allExtensions = [...jsExtensions, ...tsExtensions].join(',');

export default defineConfig({
  extends: [shared],
  overrides: [
    {
      // eslint-config-seek's `jest` block globs. `@(spec|test)` extglob becomes
      // a `{spec,test}` brace group in oxlint's glob syntax. (oxc parity, minor:
      // oxlint actually accepts the `@(spec|test)` extglob too - `@oxlint/migrate`
      // emits it verbatim - so this rewrite is cosmetic, not required.)
      files: [`**/__tests__/**/*.{${allExtensions}}`, `**/*.{spec,test}.{${allExtensions}}`],
      // Declaring the plugin inside the override scopes Jest rules (and their
      // default `correctness` set) to test files only.
      plugins: ['jest'],
      env: {
        jest: true,
      },
      // oxc parity (DISCUSS): eslint-config-seek extends `eslint-plugin-jest`'s
      // `flat/recommended`. oxlint has no named preset; enabling the `jest`
      // plugin turns on its `correctness` rules, which approximates that set.
      // `@oxlint/migrate` instead expands `flat/recommended` into 19 explicit
      // `jest/*` rules with ESLint's original severities - several are `warn`
      // (`expect-expect`, `no-commented-out-tests`, `no-disabled-tests`), the
      // rest `error` - which the default `correctness` set here does not
      // reproduce exactly. See the headline note in shared.ts.
    },
  ],
});
