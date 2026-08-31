import { defineConfig, type OxfmtConfig } from 'oxfmt';

export const defaults = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,

  sortPackageJson: false,
  ignorePatterns: [
    'dist',
    'pnpm-lock.yaml',
    '/.gantry/**/*.yaml',
    '/.gantry/**/*.yml',
    'gantry*.yaml',
    'gantry*.yml',
    'coverage',
  ],
} satisfies OxfmtConfig;

export default defineConfig(defaults);
