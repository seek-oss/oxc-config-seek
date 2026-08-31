export const KNOWN_MISSING: readonly string[] = [
  'import/no-unresolved',
  'import/no-rename-default',

  'strict',
  'no-restricted-modules',
  'react/jsx-uses-vars',
  'react/prop-types',
];

export const RENAMED: Readonly<Record<string, string>> = {
  'eslint-js/no-octal-escape': 'no-octal-escape',
  'eslint-js/no-restricted-syntax': 'no-restricted-syntax',
  'eslint-js/no-undef-init': 'no-undef-init',
  'eslint-js/spaced-comment': 'spaced-comment',
  'react-js/no-deprecated': 'react/no-deprecated',
  'typescript-js/naming-convention': 'typescript/naming-convention',
};

export const KNOWN_EXTRA: readonly string[] = [];

export const GRANULARITY_DIFFERS: readonly string[] = ['import/no-duplicates'];

export const CORE_ALIASES: readonly string[] = [
  'dot-notation',
  'no-shadow',
  'no-unused-vars',
  'no-unused-expressions',
  'no-array-constructor',
];
