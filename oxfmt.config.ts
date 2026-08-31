import { defineConfig } from 'oxfmt';

import { defaults } from './src/oxfmt/index.ts';

export default defineConfig({
  ...defaults,
  ignorePatterns: [
    ...defaults.ignorePatterns,
    'fixtures/corpus',
    'fixtures/format',
  ],
});
