export const run = () => {
  const el = cy.get('.selector');
  cy.wait(500);
  return el;
};
