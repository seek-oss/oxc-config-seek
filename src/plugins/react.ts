import { createRequire } from 'node:module';

interface RuleContext {
  settings?: Readonly<Record<string, unknown>>;
}

const require = createRequire(import.meta.url);
const noDeprecated =
  require('eslint-plugin-react/lib/rules/no-deprecated.js') as {
    meta: unknown;
    create: (context: RuleContext) => Record<string, unknown>;
  };

interface ReactSettings {
  react?: { version?: unknown };
}

const withDetectedVersion = (context: RuleContext): RuleContext => {
  const settings = (context.settings ?? {}) as ReactSettings;

  if (settings.react?.version) {
    return context;
  }

  const derived = Object.create(context) as RuleContext;

  Object.defineProperty(derived, 'settings', {
    value: { ...settings, react: { ...settings.react, version: 'detect' } },
    enumerable: true,
  });

  return derived;
};

const plugin = {
  meta: {
    name: 'react-js',
  },
  rules: {
    'no-deprecated': {
      ...noDeprecated,
      create: (context: RuleContext) =>
        noDeprecated.create(withDetectedVersion(context)),
    },
  },
};

export default plugin;
