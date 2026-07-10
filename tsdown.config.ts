import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/base.ts',
    'src/vitest/index.ts',
    'src/vitest/base.ts',
    'src/oxfmt/index.ts',
    'src/extensions.ts',
  ],
  format: ['esm'],
  dts: true,
  exports: true,
  failOnWarn: true,
  checks: {
    legacyCjs: false,
  },
  publint: true,
  attw: {
    profile: 'esm-only',
  },
});
