import { defineConfig, type OxfmtConfig } from 'oxfmt';

export const defaults = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  sortPackageJson: {
    sortScripts: true,
  },
  ignorePatterns: [
    'dist',
    '/.gantry/**/*.yaml',
    '/.gantry/**/*.yml',
    'gantry*.yaml',
    'gantry*.yml',
    'pnpm-lock.yaml',
    'coverage',
  ],
} as const satisfies OxfmtConfig;

export default defineConfig(defaults);
