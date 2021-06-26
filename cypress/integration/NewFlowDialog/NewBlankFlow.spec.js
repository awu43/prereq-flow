/// <reference types="cypress" />
// new_blank_flow.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe("NewBlankFlow", () => {
  it("Generates a new blank dialog", () => {
    cy.visit("http://localhost:8081/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get("[role=\"tablist\"]").contains("Blank").click();
    cy.get(".NewBlankFlow button").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".react-flow__node").should("not.exist");
    cy.get(".react-flow__edge").should("not.exist");
  });
});
