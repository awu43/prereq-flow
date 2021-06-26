/// <reference types="cypress" />

describe("NewBlankFlow", () => {
  it("Generates a new blank dialog", () => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get("[role=\"tablist\"]").contains("Blank").click();
    cy.get(".NewBlankFlow button").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".react-flow__node").should("not.exist");
    cy.get(".react-flow__edge").should("not.exist");
  });
});
