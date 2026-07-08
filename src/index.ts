import { defineConfig } from 'oxlint';

import base from './base.ts';
import react from './react.ts';

export default defineConfig({
  extends: [base, react],
});
