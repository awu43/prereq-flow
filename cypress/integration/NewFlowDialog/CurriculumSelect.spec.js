/// <reference types="cypress" />

describe("CurriculumSelect", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get("[role=\"tablist\"]").contains("Curriculum").click();
  });
  it("Generates a new curriculum flow without external prereqs", () => {
    cy.get(".CurriculumSelect__select-input").select("A A");
    cy.get(".CurriculumSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy
      .get(".react-flow__node")
      .each(node => (
        cy.wrap(node).invoke("attr", "data-id").should("match", /^A A\b/g)
      ));
  });
  it("Generates a new curriculum flow with external prereqs", () => {
    cy.get(".CurriculumSelect__select-input").select("A A");
    cy.get(".CurriculumSelect__external-checkbox input").check();
    cy.get(".CurriculumSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".react-flow__node").its("length").then(numCourses => {
      cy.get("[data-id^=\"A A\"").its("length").then(numAA => {
        expect(numCourses).to.be.greaterThan(numAA);
      });
    });
  });
  it("Displays Seattle curricula", () => {
    cy.get(".CampusSelect__radio-label--seattle input").check();
    cy.get(".CurriculumSelect__select-input [value=\"A A\"]");
    cy
      .get(".CurriculumSelect__select-input [value=\"B ARAB\"]")
      .should("not.exist");
    cy
      .get(".CurriculumSelect__select-input [value=\"T ACCT\"]")
      .should("not.exist");
  });
  it("Displays Bothell curricula", () => {
    cy.get(".CampusSelect__radio-label--bothell input").check();
    cy
    .get(".CurriculumSelect__select-input [value=\"A A\"]")
    .should("not.exist");
    cy.get(".CurriculumSelect__select-input [value=\"B ARAB\"]");
    cy
      .get(".CurriculumSelect__select-input [value=\"T ACCT\"]")
      .should("not.exist");
  });
  it("Displays Tacoma curricula", () => {
    cy.get(".CampusSelect__radio-label--tacoma input").check();
    cy
    .get(".CurriculumSelect__select-input [value=\"A A\"]")
    .should("not.exist");
    cy.get(".CurriculumSelect__select-input [value=\"T ACCT\"]");
    cy
      .get(".CurriculumSelect__select-input [value=\"B ARAB\"]")
      .should("not.exist");
  });
});
