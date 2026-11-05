// Ported from eslint-plugin-cypress@6.4.4 to drop its `eslint` peer dependency.
// https://github.com/cypress-io/eslint-plugin-cypress/tree/v6.4.4/lib/rules
//
// MIT License
//
// Copyright (c) 2019 Cypress.io
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import type { ESTree, Scope, Plugin } from '@oxlint/plugins';

type Node = ESTree.Node;

const isCallExpression = (
  node: Node | null | undefined,
): node is ESTree.CallExpression => node?.type === 'CallExpression';

const isMemberExpression = (
  node: Node | null | undefined,
): node is ESTree.MemberExpression => node?.type === 'MemberExpression';

const isIdentifier = (
  node: Node | null | undefined,
  name?: string,
): node is ESTree.IdentifierReference =>
  node?.type === 'Identifier' && (name === undefined || node.name === name);

const propertyName = (node: ESTree.MemberExpression) =>
  isIdentifier(node.property) ? node.property.name : undefined;

// `utils/is-root-cypress.js`, without the type-aware branch as oxlint does not
// expose a TypeScript program to JS plugins.
const isRootCypress = (node: Node): boolean => {
  if (!isCallExpression(node) || !isMemberExpression(node.callee)) {
    return false;
  }

  return (
    isIdentifier(node.callee.object, 'cy') || isRootCypress(node.callee.object)
  );
};

// `no-assigning-return-values`

const allowedCommands = new Set(['now', 'spy', 'state', 'stub']);

const isCypressCommandDeclaration = (declarator: ESTree.VariableDeclarator) => {
  const { init } = declarator;

  if (!isCallExpression(init) || !isMemberExpression(init.callee)) {
    return false;
  }

  let object: Node | undefined = init.callee.object;

  while (isCallExpression(object)) {
    object = isMemberExpression(object.callee)
      ? object.callee.object
      : undefined;
  }

  if (!object) {
    return false;
  }

  const commandName = propertyName(init.callee);

  const parent =
    (isMemberExpression(object.parent)
      ? propertyName(object.parent)
      : undefined) ??
    (isIdentifier(declarator.id) ? declarator.id.name : undefined);

  if (
    commandName &&
    (allowedCommands.has(commandName) ||
      (parent && allowedCommands.has(parent)))
  ) {
    return false;
  }

  return isIdentifier(object, 'cy');
};

// `no-async-tests`

const isAsyncTestBlock = (node: Node): node is ESTree.CallExpression =>
  isCallExpression(node) &&
  (isIdentifier(node.callee, 'it') || isIdentifier(node.callee, 'test')) &&
  node.arguments.length >= 2 &&
  'async' in node.arguments[1]! &&
  node.arguments[1].async === true;

// `no-unnecessary-waiting`

const isCalledByCy = (node: Node): boolean =>
  isIdentifier(node, 'cy') ||
  (isCallExpression(node) &&
    isMemberExpression(node.callee) &&
    isCalledByCy(node.callee.object));

const isCallingCyWait = (node: ESTree.CallExpression) =>
  isMemberExpression(node.callee) &&
  isCalledByCy(node) &&
  propertyName(node.callee) === 'wait';

const isNumberLiteral = (node: Node | null | undefined) =>
  node?.type === 'Literal' && typeof node.value === 'number';

const isIdentifierNumberConstArgument = (
  node: ESTree.CallExpression,
  scope: Scope,
) => {
  const [identifier] = node.arguments;

  if (!isIdentifier(identifier)) {
    return false;
  }

  const definition = scope.references.find(
    (ref) => ref.identifier === identifier,
  )?.resolved?.defs[0];

  if (!definition) {
    return false;
  }

  // const amount = 1000
  // cy.wait(amount)
  if (definition.type === 'Variable') {
    return (
      definition.node.type === 'VariableDeclarator' &&
      isNumberLiteral(definition.node.init)
    );
  }

  // function wait (amount = 1) { cy.wait(amount) }
  // function wait ({ ms = 1 }) { cy.wait(ms) }
  const nameParent = definition.name.parent;

  return (
    nameParent?.type === 'AssignmentPattern' &&
    isNumberLiteral(nameParent.right)
  );
};

// `unsafe-to-chain-command`

// Commands documented with 'It is unsafe to chain further commands that rely on
// the subject after xxx.'
// https://docs.cypress.io/app/core-concepts/retry-ability#Actions-should-be-at-the-end-of-chains-not-the-middle
const unsafeToChainActions = [
  'blur',
  'clear',
  'click',
  'check',
  'dblclick',
  'each',
  'focus',
  'rightclick',
  'screenshot',
  'scrollIntoView',
  'scrollTo',
  'select',
  'selectFile',
  'spread',
  'submit',
  'type',
  'trigger',
  'uncheck',
  'within',
];

const plugin = {
  meta: {
    name: 'cypress',
  },
  rules: {
    'no-assigning-return-values': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          unexpected: 'Do not assign the return value of a Cypress command',
        },
      },
      create: (context) => ({
        VariableDeclaration(node) {
          if (node.declarations.some(isCypressCommandDeclaration)) {
            context.report({ node, messageId: 'unexpected' });
          }
        },
      }),
    },

    'no-async-tests': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          unexpected: 'Avoid using async functions with Cypress tests',
        },
      },
      create: (context) => ({
        Identifier(node) {
          if (node.name !== 'cy' && node.name !== 'Cypress') {
            return;
          }

          for (const ancestor of context.sourceCode.getAncestors(
            node,
          ) as Node[]) {
            if (isAsyncTestBlock(ancestor)) {
              context.report({ node: ancestor, messageId: 'unexpected' });
            }
          }
        },
      }),
    },

    'no-unnecessary-waiting': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          unexpected: 'Do not wait for arbitrary time periods',
        },
      },
      create: (context) => ({
        CallExpression(node) {
          if (!isCallingCyWait(node)) {
            return;
          }

          if (
            isNumberLiteral(node.arguments[0]) ||
            isIdentifierNumberConstArgument(
              node,
              context.sourceCode.getScope(node),
            )
          ) {
            context.report({ node, messageId: 'unexpected' });
          }
        },
      }),
    },

    'unsafe-to-chain-command': {
      meta: {
        type: 'problem',
        schema: [
          {
            type: 'object',
            properties: {
              methods: {
                type: 'array',
                description:
                  'An additional list of methods to check for unsafe chaining.',
                default: [],
              },
            },
            additionalProperties: false,
          },
        ],
        messages: {
          unexpected:
            'It is unsafe to chain further commands that rely on the subject after this command. It is best to split the chain, chaining again from `cy.` in a next command line.',
        },
      },
      create: (context) => {
        const { methods = [] } = (context.options[0] ?? {}) as {
          methods?: Array<string | RegExp>;
        };

        const unsafeActionsRegex = new RegExp(
          [
            ...unsafeToChainActions.map((action) => `^${action}$`),
            ...methods.map((method) =>
              method instanceof RegExp ? method.source : method,
            ),
          ].join('|'),
        );

        return {
          CallExpression(node) {
            if (
              isRootCypress(node) &&
              isMemberExpression(node.callee) &&
              unsafeActionsRegex.test(propertyName(node.callee) ?? '') &&
              node.parent.type === 'MemberExpression'
            ) {
              context.report({ node, messageId: 'unexpected' });
            }
          },
        };
      },
    },
  },
} satisfies Plugin;

export default plugin;
