---
'oxc-config-seek': minor
---

Export the globs used by the config from `oxc-config-seek/globs`

oxlint applies `overrides` after top-level `rules`, so rule changes in consuming projects need to live in an override targeting the same files. `jsGlob`, `tsGlob`, `allGlob`, `cypressGlob` and `testGlobs` can now be imported instead of copied:

```ts
import { defineConfig } from 'oxlint';
import config from 'oxc-config-seek/vitest/base';
import { tsGlob } from 'oxc-config-seek/globs';

export default defineConfig({
  extends: [config],
  overrides: [
    {
      files: [tsGlob],
      rules: {
        'typescript/consistent-type-definitions': ['error', 'type'],
      },
    },
  ],
});
```
