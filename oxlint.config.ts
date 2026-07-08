import { defineConfig } from 'oxlint';

import base from './src/base.ts';

export default defineConfig({
  extends: [base],
  ignorePatterns: ['node_modules', 'fixtures', 'dist', '.changeset'],
});
