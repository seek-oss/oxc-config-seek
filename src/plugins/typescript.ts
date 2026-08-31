import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rules =
  require('@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules') as Record<
    string,
    TypeScriptRule
  >;

interface TypeScriptRule {
  meta: unknown;
  create: (context: object) => Record<string, unknown>;
}

const namingConvention = rules['naming-convention'];

if (!namingConvention) {
  throw new Error(
    '`@typescript-eslint/naming-convention` is not available in the installed @typescript-eslint/eslint-plugin',
  );
}

const EMPTY_PARSER_SERVICES = {
  esTreeNodeToTSNodeMap: new Map(),
  tsNodeToESTreeNodeMap: new Map(),
  program: null,
};

const withParserServices = (context: { sourceCode?: object }): object => {
  const sourceCode = Object.create(context.sourceCode ?? {}) as object;

  Object.defineProperty(sourceCode, 'parserServices', {
    value: EMPTY_PARSER_SERVICES,
    enumerable: true,
  });

  const derived = Object.create(context) as object;

  Object.defineProperty(derived, 'sourceCode', {
    value: sourceCode,
    enumerable: true,
  });

  return derived;
};

const plugin = {
  meta: {
    name: 'typescript-js',
  },
  rules: {
    'naming-convention': {
      ...namingConvention,
      create: (context: object) =>
        namingConvention.create(withParserServices(context)),
    },
  },
};

export default plugin;
