import { defineConfig } from 'oxlint';

import react from '../react.ts';
import base from './base.ts';

export default defineConfig({
  extends: [base, react],
});
