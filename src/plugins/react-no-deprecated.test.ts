import reactPlugin from './react.ts';
import { test } from './tester.ts';

const rule = reactPlugin.rules['no-deprecated'];

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
  ],
  invalid: [
    {
      code: `import React from 'react';
     export class Legacy extends React.Component {
       componentWillMount() { return null; }
       render() { return null; }
     }`,
      errors: 1,
    },
  ],
});
