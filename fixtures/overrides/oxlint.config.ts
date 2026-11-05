import { testGlobs, tsGlob } from 'oxc-config-seek/globs';
import config from 'oxc-config-seek/vitest/base';
import { defineConfig } from 'oxlint';

// Mirrors the "Overriding rules" README example: each rule turned off here is
// enabled by an override in the base config and violated by a fixture file.
export default defineConfig({
  extends: [config],
  overrides: [
    {
      files: [tsGlob],
      rules: {
        'typescript/array-type': 'off',
      },
    },
    {
      files: [...testGlobs],
      plugins: ['vitest'],
      rules: {
        'vitest/no-disabled-tests': 'off',
      },
    },
  ],
});
