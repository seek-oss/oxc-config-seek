---
'oxc-config-seek': minor
---

Stop installing `eslint`

`react-js/no-deprecated`, `typescript-js/naming-convention` and the `cypress/*` rules are now bundled ports instead of wrappers around `eslint-plugin-react`, `@typescript-eslint/eslint-plugin` and `eslint-plugin-cypress`, which pulled in `eslint` as a peer dependency.

`typescript-js/naming-convention` only implements the `typeLike` PascalCase policy this config enables, so overriding its options no longer changes its behaviour.
