import ALL_COURSES from "../../../src/data/final_seattle_courses.json";

describe("CurriculumSelect", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(".NewFlowDialog").contains("Continue").click().wait(300);
    cy.get('[role="tablist"]').contains("Curriculum").click();
  });
  it("Generates a new curriculum flow without external prereqs", () => {
    cy.get(".CurriculumSelect__select-input").select("A A");
    cy.get(".CurriculumSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    for (const course of ALL_COURSES) {
      if (course.id.startsWith("A A")) {
        cy.get(`[data-id="${course.id}"`);
      }
    }
  });
  it("Generates a new curriculum flow with external prereqs", () => {
    cy.get(".CurriculumSelect__select-input").select("A A");
    cy.get(".CurriculumSelect__external-checkbox input").check();
    cy.get(".CurriculumSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".react-flow__node")
      .its("length")
      .then(numCourses => {
        cy.get('[data-id^="A A"')
          .its("length")
          .then(numAA => {
            expect(numCourses).to.be.greaterThan(numAA);
          });
      });
  });
  it("Displays Seattle curricula", () => {
    cy.get(".CampusSelect__radio-label--seattle input").check();
    cy.get('.CurriculumSelect__select-input [value="A A"]');
    cy.get('.CurriculumSelect__select-input [value="B ARAB"]').should(
      "not.exist",
    );
    cy.get('.CurriculumSelect__select-input [value="T ACCT"]').should(
      "not.exist",
    );
  });
  xit("Displays Bothell curricula", () => {
    cy.get(".CampusSelect__radio-label--bothell input").check();
    cy.get('.CurriculumSelect__select-input [value="A A"]').should("not.exist");
    cy.get('.CurriculumSelect__select-input [value="B ARAB"]');
    cy.get('.CurriculumSelect__select-input [value="T ACCT"]').should(
      "not.exist",
    );
  });
  xit("Displays Tacoma curricula", () => {
    cy.get(".CampusSelect__radio-label--tacoma input").check();
    cy.get('.CurriculumSelect__select-input [value="A A"]').should("not.exist");
    cy.get('.CurriculumSelect__select-input [value="T ACCT"]');
    cy.get('.CurriculumSelect__select-input [value="B ARAB"]').should(
      "not.exist",
    );
  });
  it("Persists state", () => {
    cy.get(".CurriculumSelect__select-input").select(
      "AES: American Ethnic Studies",
    );
    // cy.get(".CampusSelect__radio-label--bothell input").check();
    // cy.get(".CurriculumSelect__select-input").select("B BIO: Biology");
    // cy.get(".CampusSelect__radio-label--tacoma input").check();
    // cy.get(".CurriculumSelect__select-input").select("T CHEM: Chemistry");
    cy.get(".CurriculumSelect__external-checkbox input").check();
    cy.get(".CurriculumSelect .AmbiguitySelect label")
      .contains("Cautiously")
      .click();
    cy.get(".CloseButton").click();
    cy.get(".Header").contains("New flow").click();
    cy.get(".CurriculumSelect");
    // cy.get(".CurriculumSelect__select-input")
    //   .find(":selected")
    //   .contains("T CHEM: Chemistry");
    // cy.get(".CampusSelect__radio-label--bothell input").check();
    // cy.get(".CurriculumSelect__select-input")
    //   .find(":selected")
    //   .contains("B BIO: Biology");
    // cy.get(".CampusSelect__radio-label--seattle input").check();
    cy.get(".CurriculumSelect__select-input")
      .find(":selected")
      .contains("AES: American Ethnic Studies");
    cy.get(".CurriculumSelect__external-checkbox input[checked]");
    cy.get('input[type="radio"][checked]').parent().contains("Cautiously");
  });
});
