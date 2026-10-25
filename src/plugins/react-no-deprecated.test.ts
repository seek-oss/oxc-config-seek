import reactPlugin from './react.ts';
import { test } from './tester.ts';

const rule = reactPlugin.rules['no-deprecated'];

const lifecycleRefs =
  'https://reactjs.org/docs/react-component.html#unsafe_componentwillmount. Use https://github.com/reactjs/react-codemod#rename-unsafe-lifecycles to automatically update your components.';

test('react-js/no-deprecated', rule, {
  valid: [
    `import React from 'react';
     export class Fine extends React.Component {
       UNSAFE_componentWillMount() { return null; }
       render() { return null; }
     }`,
    `export class NotAComponent {
       componentWillMount() { return null; }
     }`,
    `import { createRoot } from 'react-dom/client';`,
    `const { useState } = React;`,
    {
      code: `import React from 'react';
       export class Legacy extends React.Component {
         componentWillMount() { return null; }
       }`,
      settings: { react: { version: '16.8.0' } },
    },
    {
      code: `import { render } from 'react-dom';`,
      settings: { react: { version: '17.0.2' } },
    },
    {
      code: `React.PropTypes.string;`,
      settings: { react: { pragma: 'Preact' } },
    },
  ],
  invalid: [
    {
      code: `import React from 'react';
     export class Legacy extends React.Component {
       componentWillMount() { return null; }
       render() { return null; }
     }`,
      errors: [
        {
          message: `componentWillMount is deprecated since React 16.9.0, use UNSAFE_componentWillMount instead, see ${lifecycleRefs}`,
        },
      ],
    },
    {
      code: `import { Component } from 'react';
     export class Legacy extends Component {
       componentWillMount() { return null; }
     }`,
      errors: 1,
    },
    {
      code: `/** @extends React.Component */
     export class Legacy extends Base {
       componentWillMount() { return null; }
     }`,
      errors: 1,
    },
    {
      code: `const Legacy = createReactClass({
       componentWillMount() { return null; },
     });`,
      errors: 1,
    },
    {
      code: `React.createClass({});`,
      errors: [
        {
          message:
            'React.createClass is deprecated since React 15.5.0, use the npm module create-react-class instead',
        },
      ],
    },
    {
      code: `import { render } from 'react-dom';`,
      errors: [
        {
          message:
            'ReactDOM.render is deprecated since React 18.0.0, use createRoot instead, see https://reactjs.org/link/switch-to-createroot',
        },
      ],
    },
    {
      code: `const { PropTypes } = React;`,
      errors: 1,
    },
    {
      code: `const { hydrate } = require('react-dom');`,
      errors: 1,
    },
    {
      code: `/** @jsx Preact.h */
     Preact.PropTypes.string;`,
      errors: [
        {
          message:
            'Preact.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead',
        },
      ],
    },
  ],
});
