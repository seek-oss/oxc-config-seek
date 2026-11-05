import type { ESTree, Plugin } from '@oxlint/plugins';

// A fixed-policy port of `@typescript-eslint/naming-convention`, covering only
// the options this package configures: `typeLike` names in PascalCase with a
// single leading underscore allowed, and `enum` exempt.
// https://github.com/typescript-eslint/typescript-eslint/blob/v8.68.0/packages/eslint-plugin/src/rules/naming-convention.ts

// https://github.com/typescript-eslint/typescript-eslint/blob/v8.68.0/packages/eslint-plugin/src/rules/naming-convention-utils/format.ts
const isPascalCase = (name: string) =>
  name.length === 0 ||
  (name[0] === name[0]?.toUpperCase() && !name.includes('_'));

const plugin = {
  meta: {
    name: 'typescript-js',
  },
  rules: {
    'naming-convention': {
      meta: {
        type: 'suggestion',
        // Accepted for config compatibility; the policy above is fixed.
        schema: { type: 'array', items: { type: 'object' } },
        messages: {
          doesNotMatchFormat:
            '{{type}} name `{{name}}` must match one of the following formats: {{formats}}',
          doesNotMatchFormatTrimmed:
            '{{type}} name `{{name}}` trimmed as `{{processedName}}` must match one of the following formats: {{formats}}',
        },
      },
      create: (context) => {
        const check = (type: string, node: ESTree.BindingIdentifier) => {
          const { name } = node;
          const processedName = name.startsWith('_') ? name.slice(1) : name;

          if (isPascalCase(processedName)) {
            return;
          }

          context.report({
            node,
            messageId:
              processedName === name
                ? 'doesNotMatchFormat'
                : 'doesNotMatchFormatTrimmed',
            data: { type, name, processedName, formats: 'PascalCase' },
          });
        };

        const checkClass = (node: ESTree.Class) => {
          if (node.id) {
            check('Class', node.id);
          }
        };

        return {
          ClassDeclaration: checkClass,
          ClassExpression: checkClass,
          TSInterfaceDeclaration: (node) => check('Interface', node.id),
          TSTypeAliasDeclaration: (node) => check('Type Alias', node.id),
          TSTypeParameter: (node) => check('Type Parameter', node.name),
        };
      },
    },
  },
} satisfies Plugin;

export default plugin;
