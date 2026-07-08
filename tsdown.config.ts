import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/base.ts',
    'src/vitest/index.ts',
    'src/vitest/base.ts',
    'src/extensions.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  exports: {
    // oxfmt.config.ts ships as TS source (the repo's own oxfmt run reads it at
    // the root), so it is not a build entry. Re-add its export after tsdown
    // regenerates the map on each build.
    customExports(exports) {
      exports['./oxfmt'] = './oxfmt.config.ts';
      return exports;
    },
  },
  failOnWarn: true,
  checks: {
    legacyCjs: false,
  },
  publint: true,
  attw: {
    // node10's legacy resolution ignores `exports` subpaths, so the extra
    // entries (`/base`, `/vitest`, ...) have no node10 resolution by design.
    profile: 'node16',
    // `./oxfmt` ships raw TS source for oxfmt to read, not a typed module
    // entry, so it isn't meaningfully checkable by attw.
    excludeEntrypoints: ['oxfmt'],
  },
});
