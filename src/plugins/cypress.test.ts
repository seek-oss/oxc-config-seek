import cypressPlugin from './cypress.ts';
import { asOptions, test } from './tester.ts';

const { rules } = cypressPlugin;

test(
  'cypress/no-assigning-return-values',
  rules['no-assigning-return-values'],
  {
    valid: [
      `cy.get('.btn').click();`,
      `const stub = cy.stub();`,
      `const spy = cy.spy(obj, 'method');`,
      `const now = cy.now('get', '.btn');`,
      `const value = other.get('.btn');`,
    ],
    invalid: [
      {
        code: `const button = cy.get('.btn');`,
        errors: [
          { message: 'Do not assign the return value of a Cypress command' },
        ],
      },
      {
        code: `let text = cy.get('.btn').invoke('text');`,
        errors: 1,
      },
    ],
  },
);

test('cypress/no-async-tests', rules['no-async-tests'], {
  valid: [
    `it('works', () => { cy.visit('/'); });`,
    `it('works', async () => { await fetch('/'); });`,
    `describe('suite', async () => { cy.visit('/'); });`,
  ],
  invalid: [
    {
      code: `it('works', async () => { cy.visit('/'); });`,
      errors: [{ message: 'Avoid using async functions with Cypress tests' }],
    },
    {
      code: `test('works', async function () { await Cypress.env('x'); });`,
      errors: 1,
    },
  ],
});

test('cypress/no-unnecessary-waiting', rules['no-unnecessary-waiting'], {
  valid: [
    `cy.wait('@request');`,
    `cy.get('.btn').wait('@request');`,
    `const alias = '@request'; cy.wait(alias);`,
    `import { WAIT } from './constants'; cy.wait(WAIT);`,
    `function wait(ms) { cy.wait(ms); }`,
    `function wait(ms = '@request') { cy.wait(ms); }`,
    `other.wait(1000);`,
  ],
  invalid: [
    {
      code: `cy.wait(1000);`,
      errors: [{ message: 'Do not wait for arbitrary time periods' }],
    },
    {
      code: `cy.get('.btn').wait(1000);`,
      errors: 1,
    },
    {
      code: `const ms = 1000; cy.wait(ms);`,
      errors: 1,
    },
    {
      code: `function wait(ms = 1000) { cy.wait(ms); }`,
      errors: 1,
    },
    {
      code: `function wait({ ms = 1000 }) { cy.wait(ms); }`,
      errors: 1,
    },
  ],
});

test('cypress/unsafe-to-chain-command', rules['unsafe-to-chain-command'], {
  valid: [
    `cy.get('.btn').click();`,
    `cy.get('.input').type('text');`,
    `cy.get('.btn').should('be.visible').click();`,
    `other.get('.btn').click().should('be.visible');`,
  ],
  invalid: [
    {
      code: `cy.get('.btn').click().should('be.visible');`,
      errors: [
        {
          message:
            'It is unsafe to chain further commands that rely on the subject after this command. It is best to split the chain, chaining again from `cy.` in a next command line.',
        },
      ],
    },
    {
      code: `cy.get('.input').type('text').blur().should('exist');`,
      errors: 2,
    },
    {
      code: `cy.get('.btn').customAction().should('exist');`,
      options: asOptions([{ methods: ['customAction'] }]),
      errors: 1,
    },
  ],
});
