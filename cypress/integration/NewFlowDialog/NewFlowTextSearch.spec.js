/// <reference types="cypress" />

describe("NewFlowTextSearch", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get("[role=\"tablist\"]").contains("Text search").click();
  });
  it("Generates a new flow from text search", () => {
    cy.get("[role=\"tablist\"]").contains("Blank").click();
    cy.get(".NewBlankFlow button").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".Header").contains("New flow").click();
    cy.get("[role=\"tablist\"]").contains("Text search").click();

    cy.get(".NewFlowTextSearch__textarea").type("MATH 124, MATH 125, MATH 126");
    cy.get(".NewFlowTextSearch").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get("[data-id=\"MATH 124\"]");
    cy.get("[data-id=\"MATH 125\"]");
    cy.get("[data-id=\"MATH 126\"]");
  });
  it("Displays an error message when no course IDs found", () => {
    cy.get(".NewFlowTextSearch__textarea").clear();
    cy.get(".NewFlowTextSearch").contains("Get courses").click();
    cy.get(".tippy-box--error");
  });
});
