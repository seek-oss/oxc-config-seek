import { defineConfig, type OxfmtConfig } from 'oxfmt';

export const defaults = {
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  endOfLine: 'lf',
  printWidth: 80,
  sortPackageJson: true,
  semi: true,
  arrowParens: 'always',
  bracketSpacing: true,
  quoteProps: 'as-needed',
  proseWrap: 'always',
  sortImports: {
    groups: ['builtin', 'external', ['internal', 'subpath'], ['parent', 'sibling', 'index'], 'unknown'],
    newlinesBetween: true,
    ignoreCase: false,
    order: 'asc',
  },
  overrides: [
    {
      files: ['*.md'],
      options: {
        proseWrap: 'preserve',
      },
    },
  ],
  ignorePatterns: [
    '/.gantry/**/*.yaml',
    '/.gantry/**/*.yml',
    'gantry*.yaml',
    'gantry*.yml',
    'pnpm-lock.yaml',
    'coverage',
  ],
} satisfies OxfmtConfig;

export default defineConfig(defaults);
