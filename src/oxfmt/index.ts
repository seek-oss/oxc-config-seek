import { defineConfig, type OxfmtConfig } from 'oxfmt';

export const defaults = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  sortPackageJson: {
    sortScripts: true,
  },
  // Deliberately tries to match `import-x/order`'s default groups to minimize
  // changes with consumers migrating from eslint import-x to oxfmt
  sortImports: {
    ignoreCase: false,
    groups: [
      'builtin',
      'external',
      'parent',
      'sibling',
      { newlinesBetween: false },
      'index',
      ['internal', 'subpath', 'unknown'],
    ],
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
} satisfies OxfmtConfig;

export default defineConfig(defaults);
