/// <reference types="cypress" />

describe("DegreeSelect", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get("[role=\"tablist\"]").contains("Degree").click();
  });
  it("Disables the Get courses button when no degrees are selected", () => {
    cy.get(".DegreeSelect").contains("Get courses").should("be.disabled");
    cy.get(".majors__add-button").click();
    cy.get(".DegreeSelect").contains("Get courses").should("not.be.disabled");
  });
});
