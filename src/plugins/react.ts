// Ported from eslint-plugin-react@7.37.5 to drop its `eslint` peer dependency.
// https://github.com/jsx-eslint/eslint-plugin-react/blob/v7.37.5/lib/rules/no-deprecated.js
//
// The MIT License (MIT)
//
// Copyright (c) 2014 Yannick Croissant
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

import { createRequire } from 'node:module';
import path from 'node:path';

import type { Context, ESTree, Plugin } from '@oxlint/plugins';

type Node = ESTree.Node;

interface ReactSettings {
  version?: unknown;
  defaultVersion?: unknown;
  pragma?: unknown;
  createClass?: unknown;
}

const reactSettings = (context: Context): ReactSettings =>
  (context.settings.react ?? {}) as ReactSettings;

// `util/pragma.js`

const JSX_ANNOTATION_REGEX = /@jsx\s+(\S+)/;
const JS_IDENTIFIER_REGEX = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;

const getPragma = (context: Context) => {
  const pragmaComment = context.sourceCode
    .getAllComments()
    .find((comment) => JSX_ANNOTATION_REGEX.test(comment.value));

  const pragma = pragmaComment
    ? JSX_ANNOTATION_REGEX.exec(pragmaComment.value)?.[1]?.split('.')[0]
    : reactSettings(context).pragma;

  return typeof pragma === 'string' && JS_IDENTIFIER_REGEX.test(pragma)
    ? pragma
    : 'React';
};

const getCreateClass = (context: Context) => {
  const { createClass = 'createReactClass' } = reactSettings(context);

  if (
    typeof createClass !== 'string' ||
    !JS_IDENTIFIER_REGEX.test(createClass)
  ) {
    throw new Error(
      `createClass pragma ${String(createClass)} is not a valid function name`,
    );
  }

  return createClass;
};

// `util/version.js`, with `version` defaulting to `detect` and `semver`
// replaced by a `>=` comparison since that is all this rule needs.

type Version = readonly [number, number, number];

const LATEST_VERSION: Version = [999, 999, 999];

const coerceVersion = (input: string): Version | undefined => {
  const full = /^\d+\.\d+$/.test(input) ? `${input}.0` : input;
  const match = /(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(
    full
      .split('.')
      .map((part) => Number(part))
      .join('.'),
  );

  return match
    ? [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)]
    : undefined;
};

const isAtLeast = (version: Version, minimum: Version) => {
  for (let i = 0; i < 3; i++) {
    if (version[i] !== minimum[i]) {
      return version[i]! > minimum[i]!;
    }
  }

  return true;
};

// Resolution starts from the file's directory whether or not it exists on
// disk, so only virtual (relative) filenames need the cwd fallback.
const resolveFrom = (filename: string) =>
  path.isAbsolute(filename) ? filename : path.join(process.cwd(), 'noop.js');

let detectedVersion: string | undefined;

const detectReactVersion = (context: Context, defaultVersion: Version) => {
  if (detectedVersion) {
    return detectedVersion;
  }

  const require = createRequire(resolveFrom(context.filename));

  try {
    detectedVersion = (require('react') as { version: string }).version;
  } catch (err) {
    if ((err as { code?: unknown }).code !== 'MODULE_NOT_FOUND') {
      throw err;
    }

    detectedVersion = defaultVersion.join('.');
  }

  return detectedVersion;
};

const getReactVersion = (context: Context): Version => {
  const settings = reactSettings(context);

  const defaultVersion =
    (settings.defaultVersion !== undefined &&
      coerceVersion(String(settings.defaultVersion))) ||
    LATEST_VERSION;

  const version = settings.version ?? 'detect';

  return (
    coerceVersion(
      version === 'detect'
        ? detectReactVersion(context, defaultVersion)
        : String(version),
    ) ?? defaultVersion
  );
};

// `util/componentUtil.js`

const isES5Component = (node: Node, pragma: string, createClass: string) => {
  const { parent } = node;

  if (parent?.type !== 'CallExpression') {
    return false;
  }

  const { callee } = parent;

  // React.createClass({})
  if (callee.type === 'MemberExpression') {
    return (
      callee.object.type === 'Identifier' &&
      callee.object.name === pragma &&
      callee.property.type === 'Identifier' &&
      callee.property.name === createClass
    );
  }

  // createClass({})
  return callee.type === 'Identifier' && callee.name === createClass;
};

// Replaces `doctrine` parsing of `@extends` and `@augments` tags.
const EXPLICIT_COMPONENT_REGEX =
  /@(?:extends|augments)\s+\{?React\.(?:Pure)?Component\b/;

// Approximates `sourceCode.getJSDocComment`, which oxlint does not support.
const isExplicitComponent = (context: Context, node: Node) => {
  const target =
    node.parent?.type === 'ExportNamedDeclaration' ||
    node.parent?.type === 'ExportDefaultDeclaration'
      ? node.parent
      : node;

  const comment = context.sourceCode.getCommentsBefore(target).at(-1);

  return (
    comment?.type === 'Block' &&
    comment.value.startsWith('*') &&
    EXPLICIT_COMPONENT_REGEX.test(comment.value)
  );
};

const COMPONENT_REGEX = /^(Pure)?Component$/;

const isES6Component = (context: Context, node: Node, pragma: string) => {
  if (isExplicitComponent(context, node)) {
    return true;
  }

  if (node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression') {
    return false;
  }

  const { superClass } = node;

  if (superClass?.type === 'MemberExpression') {
    return (
      superClass.object.type === 'Identifier' &&
      superClass.object.name === pragma &&
      superClass.property.type === 'Identifier' &&
      COMPONENT_REGEX.test(superClass.property.name)
    );
  }

  return (
    superClass?.type === 'Identifier' && COMPONENT_REGEX.test(superClass.name)
  );
};

// `util/ast.js`

const getComponentProperties = (node: Node): Node[] => {
  switch (node.type) {
    case 'ClassDeclaration':
    case 'ClassExpression':
      return node.body.body;
    case 'ObjectExpression':
      return node.properties;
    default:
      return [];
  }
};

const getPropertyNameNode = (node: Node): Node | null => {
  if ('key' in node && node.key) {
    return node.key;
  }

  if (node.type === 'MemberExpression') {
    return node.property;
  }

  return null;
};

const getPropertyName = (node: Node | null) =>
  node && 'name' in node && typeof node.name === 'string' ? node.name : '';

// `rules/no-deprecated.js`

const MODULES: Record<string, string[]> = {
  react: ['React'],
  'react-addons-perf': ['ReactPerf', 'Perf'],
  'react-dom': ['ReactDOM'],
  'react-dom/server': ['ReactDOMServer'],
};

type Deprecation = [version: string, replacement?: string, refs?: string];

const getDeprecated = (pragma: string) =>
  new Map<string, Deprecation>([
    // 0.12.0
    [`${pragma}.renderComponent`, ['0.12.0', `${pragma}.render`]],
    [
      `${pragma}.renderComponentToString`,
      ['0.12.0', `${pragma}.renderToString`],
    ],
    [
      `${pragma}.renderComponentToStaticMarkup`,
      ['0.12.0', `${pragma}.renderToStaticMarkup`],
    ],
    [`${pragma}.isValidComponent`, ['0.12.0', `${pragma}.isValidElement`]],
    [
      `${pragma}.PropTypes.component`,
      ['0.12.0', `${pragma}.PropTypes.element`],
    ],
    [`${pragma}.PropTypes.renderable`, ['0.12.0', `${pragma}.PropTypes.node`]],
    [`${pragma}.isValidClass`, ['0.12.0']],
    ['this.transferPropsTo', ['0.12.0', 'spread operator ({...})']],
    // 0.13.0
    [`${pragma}.addons.classSet`, ['0.13.0', 'the npm module classnames']],
    [`${pragma}.addons.cloneWithProps`, ['0.13.0', `${pragma}.cloneElement`]],
    // 0.14.0
    [`${pragma}.render`, ['0.14.0', 'ReactDOM.render']],
    [
      `${pragma}.unmountComponentAtNode`,
      ['0.14.0', 'ReactDOM.unmountComponentAtNode'],
    ],
    [`${pragma}.findDOMNode`, ['0.14.0', 'ReactDOM.findDOMNode']],
    [`${pragma}.renderToString`, ['0.14.0', 'ReactDOMServer.renderToString']],
    [
      `${pragma}.renderToStaticMarkup`,
      ['0.14.0', 'ReactDOMServer.renderToStaticMarkup'],
    ],
    // 15.0.0
    [`${pragma}.addons.LinkedStateMixin`, ['15.0.0']],
    ['ReactPerf.printDOM', ['15.0.0', 'ReactPerf.printOperations']],
    ['Perf.printDOM', ['15.0.0', 'Perf.printOperations']],
    ['ReactPerf.getMeasurementsSummaryMap', ['15.0.0', 'ReactPerf.getWasted']],
    ['Perf.getMeasurementsSummaryMap', ['15.0.0', 'Perf.getWasted']],
    // 15.5.0
    [`${pragma}.createClass`, ['15.5.0', 'the npm module create-react-class']],
    [`${pragma}.addons.TestUtils`, ['15.5.0', 'ReactDOM.TestUtils']],
    [`${pragma}.PropTypes`, ['15.5.0', 'the npm module prop-types']],
    // 15.6.0
    [`${pragma}.DOM`, ['15.6.0', 'the npm module react-dom-factories']],
    // 16.9.0
    [
      'componentWillMount',
      [
        '16.9.0',
        'UNSAFE_componentWillMount',
        'https://reactjs.org/docs/react-component.html#unsafe_componentwillmount. ' +
          'Use https://github.com/reactjs/react-codemod#rename-unsafe-lifecycles to automatically update your components.',
      ],
    ],
    [
      'componentWillReceiveProps',
      [
        '16.9.0',
        'UNSAFE_componentWillReceiveProps',
        'https://reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops. ' +
          'Use https://github.com/reactjs/react-codemod#rename-unsafe-lifecycles to automatically update your components.',
      ],
    ],
    [
      'componentWillUpdate',
      [
        '16.9.0',
        'UNSAFE_componentWillUpdate',
        'https://reactjs.org/docs/react-component.html#unsafe_componentwillupdate. ' +
          'Use https://github.com/reactjs/react-codemod#rename-unsafe-lifecycles to automatically update your components.',
      ],
    ],
    // 18.0.0
    [
      'ReactDOM.render',
      ['18.0.0', 'createRoot', 'https://reactjs.org/link/switch-to-createroot'],
    ],
    [
      'ReactDOM.hydrate',
      [
        '18.0.0',
        'hydrateRoot',
        'https://reactjs.org/link/switch-to-createroot',
      ],
    ],
    [
      'ReactDOM.unmountComponentAtNode',
      [
        '18.0.0',
        'root.unmount',
        'https://reactjs.org/link/switch-to-createroot',
      ],
    ],
    [
      'ReactDOMServer.renderToNodeStream',
      [
        '18.0.0',
        'renderToPipeableStream',
        'https://reactjs.org/docs/react-dom-server.html#rendertonodestream',
      ],
    ],
  ]);

const getReactModuleName = (node: ESTree.VariableDeclarator) => {
  const { init } = node;

  if (!init) {
    return undefined;
  }

  const [firstArgument] = init.type === 'CallExpression' ? init.arguments : [];

  for (const [key, moduleNames] of Object.entries(MODULES)) {
    const moduleName =
      firstArgument?.type === 'Literal' && firstArgument.value === key
        ? moduleNames[0]
        : moduleNames.find(
            (name: string) => init.type === 'Identifier' && init.name === name,
          );

    if (moduleName) {
      return moduleName;
    }
  }

  return undefined;
};

const plugin = {
  meta: {
    name: 'react-js',
  },
  rules: {
    'no-deprecated': {
      meta: {
        type: 'suggestion',
        schema: [],
        messages: {
          deprecated:
            '{{oldMethod}} is deprecated since React {{version}}{{newMethod}}{{refs}}',
        },
      },
      create: (context) => {
        const pragma = getPragma(context);
        const deprecated = getDeprecated(pragma);

        let reactVersion: Version | undefined;

        const checkDeprecation = (
          node: Node,
          methodName: string | undefined,
          methodNode?: Node | null,
        ) => {
          const deprecation = methodName
            ? deprecated.get(methodName)
            : undefined;

          if (!methodName || !deprecation) {
            return;
          }

          const [version, newMethod, refs] = deprecation;

          reactVersion ??= getReactVersion(context);

          if (!isAtLeast(reactVersion, coerceVersion(version)!)) {
            return;
          }

          context.report({
            node: methodNode ?? node,
            messageId: 'deprecated',
            data: {
              oldMethod: methodName,
              version,
              newMethod: newMethod ? `, use ${newMethod} instead` : '',
              refs: refs ? `, see ${refs}` : '',
            },
          });
        };

        const checkLifeCycleMethods = (node: Node) => {
          if (
            !isES5Component(node, pragma, getCreateClass(context)) &&
            !isES6Component(context, node, pragma)
          ) {
            return;
          }

          for (const property of getComponentProperties(node)) {
            const nameNode = getPropertyNameNode(property);

            checkDeprecation(node, getPropertyName(nameNode), nameNode);
          }
        };

        return {
          MemberExpression(node) {
            checkDeprecation(node, context.sourceCode.getText(node));
          },

          ImportDeclaration(node) {
            const moduleName = Object.hasOwn(MODULES, node.source.value)
              ? MODULES[node.source.value]?.[0]
              : undefined;

            if (!moduleName) {
              return;
            }

            for (const specifier of node.specifiers) {
              if (
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.type === 'Identifier'
              ) {
                checkDeprecation(
                  node,
                  `${moduleName}.${specifier.imported.name}`,
                  specifier,
                );
              }
            }
          },

          VariableDeclarator(node) {
            if (node.id.type !== 'ObjectPattern') {
              return;
            }

            const reactModuleName = getReactModuleName(node);

            const isReactRequire =
              node.init?.type === 'CallExpression' &&
              node.init.callee.type === 'Identifier' &&
              node.init.callee.name === 'require' &&
              node.init.arguments[0]?.type === 'Literal' &&
              typeof node.init.arguments[0].value === 'string' &&
              Object.hasOwn(MODULES, node.init.arguments[0].value);

            if (!reactModuleName && !isReactRequire) {
              return;
            }

            for (const property of node.id.properties) {
              if (
                property.type === 'Property' &&
                property.key.type === 'Identifier'
              ) {
                checkDeprecation(
                  node,
                  `${reactModuleName ?? pragma}.${property.key.name}`,
                  property,
                );
              }
            }
          },

          ClassDeclaration: checkLifeCycleMethods,
          ClassExpression: checkLifeCycleMethods,
          ObjectExpression: checkLifeCycleMethods,
        };
      },
    },
  },
} satisfies Plugin;

export default plugin;
