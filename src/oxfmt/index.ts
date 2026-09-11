import { defineConfig, type OxfmtConfig } from 'oxfmt';

export const defaults = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  printWidth: 80,
  sortPackageJson: {
    sortScripts: true,
  },
  // Mirrors the group ranks of `import-x/order`, which omits `internal`,
  // `object`, `type` and `unknown` from its default groups and lumps them into
  // a trailing group. Type imports are deliberately not given their own group;
  // `import-x` ranks them by path when `type` is omitted.
  sortImports: {
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
