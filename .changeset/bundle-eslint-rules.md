---
'oxc-config-seek': minor
---

Stop installing `eslint`

`typescript-js/naming-convention` and the `cypress/*` rules are now bundled ports instead of wrappers around `@typescript-eslint/eslint-plugin` and `eslint-plugin-cypress`, which pulled in `eslint` as a peer dependency.

`react-js/no-deprecated` has been replaced with oxlint's type-aware `typescript/no-deprecated`, enabled on TypeScript files in the React entrypoints. This also reports deprecated APIs outside React.

`typescript-js/naming-convention` only implements the `typeLike` PascalCase policy this config enables, so overriding its options no longer changes its behaviour.
