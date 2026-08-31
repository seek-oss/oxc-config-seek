import { defineConfig } from 'oxlint';

import { js as jsExtensions, ts as tsExtensions } from '../extensions.ts';
import shared from '../shared.ts';

const allExtensions = [...jsExtensions, ...tsExtensions].join(',');

export default defineConfig({
  extends: [shared],
  overrides: [
    {
      files: [
        `**/__tests__/**/*.{${allExtensions}}`,
        `**/*.{spec,test}.{${allExtensions}}`,
      ],
      plugins: ['vitest'],
      rules: {
        'vitest/expect-expect': 'error',
        'vitest/no-commented-out-tests': 'error',
        'vitest/no-conditional-expect': 'error',
        'vitest/no-disabled-tests': 'warn',
        'vitest/no-identical-title': 'error',
        'vitest/no-import-node-test': 'error',
        'vitest/no-interpolation-in-snapshots': 'error',
        'vitest/no-mocks-import': 'error',
        'vitest/no-standalone-expect': 'error',
        'vitest/no-unneeded-async-expect-function': 'error',
        'vitest/prefer-called-exactly-once-with': 'error',
        'vitest/require-local-test-context-for-concurrent-snapshots': 'error',
        'vitest/valid-describe-callback': 'error',
        'vitest/valid-expect': 'error',
        'vitest/valid-expect-in-promise': 'error',
        'vitest/valid-title': 'error',

        'vitest/no-focused-tests': 'error',
      },
    },
  ],
});
