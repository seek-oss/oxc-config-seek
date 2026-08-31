import { defineConfig } from 'eslint/config';
import config from 'eslint-config-seek/vitest';

export default defineConfig({ extends: [config] });
