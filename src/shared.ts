import { defineConfig } from 'oxlint';

import { js as jsExtensions, ts as tsExtensions } from './extensions.ts';

// Mirror of eslint-config-seek/src/shared.ts for the OXC toolchain (oxlint).
//
// eslint-config-seek expresses its config as an array of flat-config blocks,
// each scoped with `files`. oxlint takes a single config object and scopes
// per-file via the `overrides` array, so the block structure is folded into:
//   - top-level `rules`  -> the global `baseRules`
//   - overrides[ts]      -> the `typescript` block
//   - overrides[js]      -> the `javascript` block
//
// Severity mapping: eslint-config-seek uses numeric 0/1/2. oxlint accepts the
// same numbers but we use the string form ('off'/'error') for readability.
//
// Plugin note: oxlint implements these plugins natively in Rust. `import`
// includes eslint-plugin-import-x, `typescript` includes @typescript-eslint,
// `react` includes react-hooks. Setting `plugins` replaces oxlint's default
// set, and plugin lists UNION across `extends`, so we list every plugin the
// composed configs rely on. `eslint` must be listed to keep core rules active.
//
// oxc parity (DISCUSS - rule-enablement model): this is the biggest structural
// difference from eslint-config-seek, and from what `@oxlint/migrate` produces.
// eslint-config-seek enables its base rules PLUS whole presets: typescript-eslint
// recommended + stylistic, eslint-plugin-react recommended, jest/vitest
// recommended, and import-x errors + warnings. This config instead enables the
// plugins and relies on oxlint's DEFAULT `correctness` category to approximate
// those presets. `@oxlint/migrate` takes the opposite (and more faithful)
// approach: it sets `categories: { correctness: 'off' }` and then lists every
// preset rule explicitly (109 rules for base, 129 for the react entrypoint),
// preserving ESLint's severities.
//
// The two rule sets therefore differ. oxlint's default `correctness` only
// partially overlaps ESLint's presets: some recommended rules are on by default
// (e.g. `react/jsx-no-duplicate-props`), but many that eslint-config-seek
// enabled are NOT (verified: `no-array-constructor`, `typescript/no-namespace`,
// and most of tseslint-stylistic do not fire here), and oxlint may enable
// correctness rules eslint-config-seek never had. Decide whether to adopt
// migrate's `correctness: off` + explicit-expansion model for true parity, or
// keep this defaults-based approximation for maintainability. The full list of
// omitted preset rules is captured in the migrate-comparison notes.
const jsGlob = `**/*.{${jsExtensions.join(',')}}`;
const tsGlob = `**/*.{${tsExtensions.join(',')}}`;

export default defineConfig({
  plugins: ['eslint', 'import', 'typescript', 'node', 'unicorn'],

  // eslint-config-seek sets `languageOptions.globals = globals.node` plus
  // ecmaVersion 'latest' / sourceType 'module'. oxlint infers module/ecma
  // version from the source, so only the environment needs declaring.
  // (oxc parity, cosmetic: `@oxlint/migrate` emits `env: { builtin, node }`
  // rather than `es2024`. Both are valid oxlint envs; `es2024` is the closer
  // match to ESLint's `ecmaVersion: 'latest'`.)
  env: {
    node: true,
    es2024: true,
  },

  // oxc parity: eslint-config-seek layers `eslint-config-prettier` to disable
  // formatting rules, then re-enables `curly`. oxlint ships almost no
  // formatting rules (formatting is oxfmt's job), so the disable layer is
  // unnecessary; we keep only the `curly` intent.
  //
  // oxc parity: `settings['import-x/resolver'] = { typescript, node }` has no
  // oxlint equivalent. oxlint's `import` plugin performs its own module
  // resolution and exposes no resolver knob, so the setting is dropped.
  // (`@oxlint/migrate` does emit a top-level `settings` block with
  // `import-x/resolver`, `import-x/parsers`, `import-x/extensions` and
  // `import-x/external-module-folders`, but oxlint ignores all of them - migrate
  // itself warns that settings are skipped - so dropping them changes nothing.)
  rules: {
    // Possible Errors
    'no-console': 'error',
    'no-unexpected-multiline': 'error',
    'block-scoped-var': 'error',
    'default-case': 'error',
    // oxc parity: `dot-notation` exists in oxlint only under the typescript
    // plugin, not as a core rule. It is enabled for TS files in the override
    // below (plain JS/JSX files lose this check), and note it is TYPE-AWARE in
    // oxlint: it only reports when linting with `--type-aware` (which requires
    // the `oxlint-tsgolint` package).
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'guard-for-in': 'error',
    'no-alert': 'error',
    'no-caller': 'error',
    'no-div-regex': 'error',
    'no-else-return': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-fallthrough': 'error',
    // oxc parity: `no-floating-decimal` (deprecated formatting rule in ESLint)
    // is not implemented by oxlint. oxfmt normalises numeric literals instead.
    'no-implicit-coercion': 'error',
    'no-implied-eval': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-new': 'error',
    // oxc parity: `no-octal-escape` is not implemented by oxlint. Dropped.
    'no-param-reassign': 'error',
    'no-proto': 'error',
    'no-return-assign': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-call': 'error',
    'no-void': 'error',
    radix: 'error',
    'vars-on-top': 'error',
    yoda: 'error',
    // oxc parity: `strict` (['error', 'never']) is not implemented by oxlint.
    // ES modules are always strict, so the practical effect is unchanged.
    'no-label-var': 'error',
    'no-shadow': 'error',
    // oxc parity: `no-undef-init` is not implemented by oxlint. Dropped.
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],

    // Node rules. In ESLint these are deprecated core rules; oxlint reimplements
    // them under the `node` plugin (except `no-process-exit`, see below).
    // Note: `@oxlint/migrate` does NOT emit these - it skips the deprecated core
    // rules and only prints a hint to add the `node/*` versions manually, so
    // this config is more complete than the mechanical migration here.
    'node/handle-callback-err': 'error',
    'node/no-new-require': 'error',
    'node/no-path-concat': 'error',
    // oxc parity: `no-process-exit` lives under oxlint's `unicorn` plugin, not
    // `node`. Same behaviour, different namespace. (`@oxlint/migrate` suggests
    // `node/no-process-exit`, but that rule does NOT exist in oxlint 1.72 -
    // "Rule 'no-process-exit' not found in plugin 'node'" - so `unicorn/` is the
    // only working form. Migrate's hint is wrong here.)
    'unicorn/no-process-exit': 'error',
    // oxc parity: `no-restricted-modules` (deprecated in ESLint, superseded by
    // no-restricted-imports) is not implemented by oxlint. Dropped.
    'node/no-sync': 'error',

    // oxc parity: `no-restricted-syntax` is not implemented by oxlint (there is
    // no AST-selector rule engine). eslint-config-seek used it to ban custom
    // getters/setters (MethodDefinition/Property with kind get|set). There is
    // no oxlint equivalent, so this ban cannot be enforced and is dropped.

    // oxc parity: `linebreak-style` (['error', 'unix']) is a formatting concern
    // owned by oxfmt (`endOfLine: 'lf'`), so it is dropped here.
    'new-cap': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',
    // oxc parity: `spaced-comment` is not implemented by oxlint. Dropped.
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    // oxc parity: `no-return-await` (deliberately OFF in eslint-config-seek to
    // let devs trade performance for stack traces) was removed from ESLint and
    // is not implemented by oxlint. It is off by default, so this is a no-op.

    // From eslint-config-seek's `prettier` block: the one rule re-enabled after
    // eslint-config-prettier turns off formatting rules.
    curly: ['error', 'all'],
  },

  overrides: [
    {
      // eslint-config-seek's `typescript` block: typescript-eslint
      // recommended + stylistic, plus the customisations below.
      //
      // oxc parity: eslint-config-seek extends
      // `tseslint.configs.recommended` and `.stylistic`. There is no 1:1
      // mapping of those rule sets to oxlint. oxlint enables its `typescript`
      // plugin's `correctness` rules by default; the recommended/stylistic
      // baselines are approximated by that default plus the explicit rules
      // below. Rules requiring full type information are called out inline.
      //
      // oxc parity (DISCUSS): `@oxlint/migrate` expands recommended+stylistic
      // into ~30 explicit `typescript/*` rules that are omitted here (relying on
      // defaults instead). Verified as NOT enabled by oxlint's default set, so
      // this config currently loses them vs eslint-config-seek: `no-array-
      // constructor`, `no-empty-function` (off), `typescript/no-namespace`,
      // `no-require-imports`, `no-this-alias`, `no-misused-new`, `prefer-as-
      // const`, `prefer-for-of`, `prefer-function-type`, `consistent-type-
      // assertions`, `consistent-indexed-object-style`, `adjacent-overload-
      // signatures`, `ban-tslint-comment`, `class-literal-property-style`,
      // `triple-slash-reference`, and more. See the headline note above.
      files: [tsGlob],
      rules: {
        'typescript/array-type': ['error', { default: 'array-simple' }],
        'typescript/consistent-type-definitions': 'off',
        // oxc parity: `@typescript-eslint/no-unused-expressions` and
        // `@typescript-eslint/no-unused-vars` have no typescript-plugin variant
        // in oxlint. The core `no-unused-expressions` / `no-unused-vars` rules
        // (the latter inherited from base) cover TS files.
        'no-unused-expressions': 'error',
        // `@typescript-eslint/no-use-before-define` is OFF in seek; the core
        // rule is only enabled for JS below, so nothing to disable here.
        'typescript/no-non-null-assertion': 'off',
        'typescript/ban-ts-comment': 'off',
        'typescript/no-explicit-any': 'off',
        'typescript/explicit-function-return-type': 'off',
        // oxc parity: `@typescript-eslint/naming-convention` is NOT implemented
        // by oxlint. eslint-config-seek used it to require PascalCase for
        // type-like names (allowing a leading underscore) while exempting
        // enums. There is no oxlint equivalent, so this convention cannot be
        // enforced and is dropped.
        // `@typescript-eslint/no-empty-function` is OFF in seek and has no
        // oxlint typescript variant; nothing to disable.
        'typescript/no-empty-interface': 'off',
        'typescript/no-inferrable-types': ['error', { ignoreParameters: true }],
        // Prefer TypeScript exhaustiveness checking over default-case in TS.
        'default-case': 'off',
        'arrow-body-style': ['error', 'as-needed'],
        // oxc parity: eslint-config-seek disables core `no-shadow` for TS and
        // uses `@typescript-eslint/no-shadow` (to avoid enum false positives).
        // oxlint has no `typescript/no-shadow`, so we keep the core `no-shadow`
        // (inherited as 'error' from base) active for TS rather than lose
        // shadow detection entirely. This may produce false positives on enums.
        // `dot-notation`, moved here because oxlint only implements the
        // typescript-plugin variant (see base rules note above).
        'typescript/dot-notation': 'error',
        // These deal with autofixing type imports/exports.
        // `consistent-type-imports` is syntactic in oxlint and reports without
        // type information. oxc parity: `consistent-type-exports` is TYPE-AWARE
        // in oxlint and only reports under `--type-aware` (requires the
        // `oxlint-tsgolint` package); without it the rule is inert. Options are
        // passed through as-is.
        'typescript/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
        'typescript/consistent-type-exports': ['error', { fixMixedExportsWithInlineTypeSpecifier: true }],
        'typescript/no-import-type-side-effects': 'error',
        // In-module merging: inline type imports when merging with other imports.
        'import/no-duplicates': ['error', { 'prefer-inline': true }],
        // oxc parity (DISCUSS): oxlint classes `import/export` as a NURSERY rule
        // (`@oxlint/migrate` skips it for that reason). Setting it explicitly
        // works today but relies on an unstable rule - revisit if it changes.
        'import/export': 'error',
      },
    },
    {
      // eslint-config-seek's `javascript` block.
      files: [jsGlob],
      rules: {
        'no-undef': 'error',
        'no-use-before-define': ['error', { functions: false }],
        'no-unused-expressions': 'error',
        // oxc parity: `import-x/no-unresolved` is NOT implemented by oxlint
        // (module resolution is handled internally with no reporting rule).
        // eslint-config-seek ignored `.svg` and `file?` specifiers here; there
        // is no oxlint equivalent, so unresolved-import checking is dropped.
        //
        // oxc parity (DISCUSS): eslint-config-seek pulls in import-x's `errors`
        // + `warnings` presets on JS files. `@oxlint/migrate` expands these to
        // `import/namespace`, `import/default`, `import/no-named-as-default`
        // (warn), `import/no-named-as-default-member` (warn) and
        // `import/no-duplicates` (warn). Only `no-duplicates` is kept here (as
        // error); the others are omitted. See the headline note above.
        'import/no-duplicates': 'error',
        // oxc parity (DISCUSS): nursery rule, as in the TS block above.
        'import/export': 'error',
      },
    },
    // oxc parity (DISCUSS): eslint-config-seek adds an `eslint-plugin-cypress`
    // block (recommended config, scoped to **/cypress/**). oxlint has no native
    // Cypress plugin, so this block is dropped here. However, `@oxlint/migrate`
    // DOES carry it over via oxlint's JS-plugin bridge: an override with
    // `jsPlugins: ['eslint-plugin-cypress']`, the 4 recommended rules
    // (`cypress/no-assigning-return-values`, `no-unnecessary-waiting`,
    // `no-async-tests`, `unsafe-to-chain-command`), plus the cypress globals and
    // browser/mocha env. Decide whether to adopt `jsPlugins` (extra dep + a JS
    // runtime for oxlint) or accept the coverage loss.
    //
    // oxc parity (DISCUSS): eslint-config-seek also spreads
    // `eslint-plugin-import-zod`'s recommended config over TS files, dropped
    // here. `@oxlint/migrate` likewise carries it via
    // `jsPlugins: ['eslint-plugin-import-zod']` + `import-zod/prefer-zod-
    // namespace`. Same jsPlugins decision as Cypress above.
  ],
});
