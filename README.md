# oxc-config-seek

Shareable [oxlint] and [oxfmt] config for SEEK: the [OXC] toolchain equivalent
of [`eslint-config-seek`]

It aims for behavioural parity with those configs. Where oxlint or oxfmt cannot
express something the ESLint/Prettier setup did, the source files carry an inline
`// oxc parity:` comment recording the decision. See [Parity notes](#parity-notes).

[oxc]: https://oxc.rs
[oxlint]: https://oxc.rs/docs/guide/usage/linter
[oxfmt]: https://oxc.rs/docs/guide/usage/formatter
[`eslint-config-seek`]: https://github.com/seek-oss/eslint-config-seek

## Requirements

- oxlint's TypeScript config (`oxlint.config.ts`) and oxfmt's `oxfmt.config.ts`
  require a Node.js runtime that can execute TypeScript: **Node.js 22.18+ or
  24+**.
- Install `oxlint`, `oxfmt`, and `typescript` (declared as peer dependencies).

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
| `oxc-config-seek`             | React + Jest      |
| `oxc-config-seek/base`        | No React + Jest   |
| `oxc-config-seek/vitest`      | React + Vitest    |
| `oxc-config-seek/vitest/base` | No React + Vitest |

`oxc-config-seek/extensions` exports the `js` / `ts` file-extension arrays used
to build globs, mirroring `eslint-config-seek/extensions`.

Composition mirrors `eslint-config-seek`: `.` = `base` + `react`, `base` =
shared + Jest, `vitest` = `vitest/base` + `react`, `vitest/base` = shared +
Vitest.

## Formatting (`oxfmt`)

Re-export it from your `oxfmt.config.ts`

```ts
export { default } from 'oxc-config-seek/oxfmt';
```

This applies `singleQuote`, `tabWidth: 2` and package.json key sorting.
