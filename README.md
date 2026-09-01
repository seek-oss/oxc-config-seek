# oxc-config-seek

> [!WARNING]
> This project is still under active development and is not yet ready for
> production use. APIs and behaviour may change without notice.

Shareable [Oxfmt] and [Oxlint] config for SEEK: the [Oxc] toolchain equivalent
of [`eslint-config-seek`]

It aims for behavioural parity with those configs. Every rule
`eslint-config-seek` enables is listed explicitly here at its original severity,
rather than approximated by oxlint's defaults.

Two rules cannot be reproduced. They are listed in [Known gaps](#known-gaps).

[Oxc]: https://oxc.rs
[Oxfmt]: https://oxc.rs/docs/guide/usage/formatter
[Oxlint]: https://oxc.rs/docs/guide/usage/linter
[`eslint-config-seek`]: https://github.com/seek-oss/eslint-config-seek

## Requirements

- oxlint's TypeScript config (`oxlint.config.ts`) and oxfmt's `oxfmt.config.ts`
  require a Node.js runtime that can execute TypeScript: **Node.js 22.18+ or
  24+**.
- Install `oxlint`, `oxfmt`, `typescript` and `oxlint-tsgolint` (declared as
  peer dependencies).

`oxlint-tsgolint` is required, not optional. `eslint-config-seek` runs with type
information, so this config sets `options.typeAware`, which needs
`oxlint-tsgolint` present; without it oxlint exits with
`Failed to find tsgolint executable`. No CLI flag is needed.

A handful of rules oxlint does not implement natively are supplied by real
ESLint plugins running through oxlint's `jsPlugins` bridge. Those plugins ship
as dependencies of this package, so nothing extra needs installing.

Because `eslint`, `react` and `typescript` are reserved plugin names in oxlint,
those rules register under a `-js` alias. Use these names if you need to
override or disable one:

| Enabled as                        | Is                                     |
| --------------------------------- | -------------------------------------- |
| `eslint-js/no-undef-init`         | `no-undef-init`                        |
| `eslint-js/no-octal-escape`       | `no-octal-escape`                      |
| `eslint-js/spaced-comment`        | `spaced-comment`                       |
| `eslint-js/no-restricted-syntax`  | `no-restricted-syntax`                 |
| `react-js/no-deprecated`          | `react/no-deprecated`                  |
| `typescript-js/naming-convention` | `@typescript-eslint/naming-convention` |

## Linting (`oxlint`)

Pick the entrypoint that matches your project and re-export it from your
`oxlint.config.ts` via oxlint's `extends`:

```ts
import { defineConfig } from 'oxlint';
import config from 'oxc-config-seek';

export default defineConfig({
  extends: [config],
});
```

| Entrypoint                    | Project type      |
| ----------------------------- | ----------------- |
| `oxc-config-seek`             | React             |
| `oxc-config-seek/base`        | No React          |
| `oxc-config-seek/vitest`      | React + Vitest    |
| `oxc-config-seek/vitest/base` | No React + Vitest |

`oxc-config-seek/extensions` exports the `js` / `ts` file-extension arrays used
to build globs, mirroring `eslint-config-seek/extensions`.

Composition mirrors `eslint-config-seek`: `.` = `base` + `react`, `base` =
shared, `vitest` = `vitest/base` + `react`, `vitest/base` = shared + Vitest.

## Formatting (`oxfmt`)

Re-export it from your `oxfmt.config.ts`

```ts
export { default } from 'oxc-config-seek/oxfmt';
```

## Known gaps

Two rules are enabled by `eslint-config-seek` and cannot be enforced here. Both
apply only to JavaScript files:

| Rule                         | Effect                                   | Why                                                           |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| `import-x/no-unresolved`     | Unresolved imports are not flagged in JS | A shared config cannot deliver the resolver settings it needs |
| `import-x/no-rename-default` | Renamed default imports are not flagged  | oxlint's plugin parser cannot read other modules yet          |

For TypeScript, `tsc --noEmit` already catches unresolved imports, so the
practical loss is limited to pure-JavaScript code.

If you do want `no-unresolved`, you can enable it yourself. Settings are dropped
when a config is consumed through `extends`, but they apply normally in **your
own** root config, which is why this has to be opt-in:

```ts
import { defineConfig } from 'oxlint';
import config from 'oxc-config-seek';

export default defineConfig({
  extends: [config],
  // Only works here, in the root config - never through `extends`.
  settings: { 'import-x/resolver': { typescript: true, node: true } },
  overrides: [
    {
      files: ['**/*.{js,cjs,mjs,jsx}'],
      jsPlugins: [{ name: 'import-js', specifier: 'eslint-plugin-import-x' }],
      rules: {
        'import-js/no-unresolved': [
          'error',
          { commonjs: true, amd: true, ignore: ['.svg$', '^file?'] },
        ],
      },
    },
  ],
});
```

This needs `eslint-plugin-import-x` installed, and `import` is a reserved plugin
name in oxlint, hence the `import-js` alias.
