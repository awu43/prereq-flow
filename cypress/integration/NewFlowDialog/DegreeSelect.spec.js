/// <reference types="cypress" />

describe("DegreeSelect", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowDialog").contains("Continue").click();
    cy.get('[role="tablist"]').contains("Degree").click();
  });
  it("Generates a new flow from majors", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering"
    );
    cy.get(".majors__add-button").click();
    cy.get(".DegreeSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.request("POST", "localhost:3000/degrees", [
      "Aeronautical and Astronautical Engineering",
    ]).then(resp => {
      for (const course of resp.body) {
        cy.get(`[data-id="${course.id}"`);
      }
    });
  });
  it("Adds a major", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering"
    );
    cy.get(".majors__add-button").click();
    cy.get(".majors__selected-list").contains(
      "Aeronautical and Astronautical Engineering"
    );
  });
  it("Deletes a major", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering"
    );
    cy.get(".majors__add-button").click();
    cy.get(".majors__selected-list").contains(
      "Aeronautical and Astronautical Engineering"
    );
    cy.get(".majors__delete-button").click();
    cy.get(".majors__selected-list")
      .contains("Aeronautical and Astronautical Engineering")
      .should("not.exist");
  });
  it("Disables the add button when current selection already selected", () => {
    cy.get(".majors__add-button").click();
    cy.get(".majors__add-button").should("be.disabled");
    cy.get(".majors__select-input").select("Biochemistry");
    cy.get(".majors__add-button").should("not.be.disabled");
  });
  it("Disables the add button when three majors are selected", () => {
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Biochemistry");
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Chemical Engineering");
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Electrical Engineering");
    cy.get(".majors__add-button").should("be.disabled");
  });
  it("Disables the Get courses button when no degrees are selected", () => {
    cy.get(".DegreeSelect").contains("Get courses").should("be.disabled");
    cy.get(".majors__add-button").click();
    cy.get(".DegreeSelect").contains("Get courses").should("not.be.disabled");
  });
});
