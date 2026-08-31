// Plain JS, deliberately: the Cypress override's `env`/`globals` only have an
// observable effect where `no-undef` runs, which eslint-config-seek scopes to
// JS files. A TS spec cannot exercise them, which is how the missing mocha
// globals went unnoticed. Must lint clean in both toolchains.
describe('login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('signs in', () => {
    cy.get('.username').type('someone');
    cy.get('form').submit();
  });
});
