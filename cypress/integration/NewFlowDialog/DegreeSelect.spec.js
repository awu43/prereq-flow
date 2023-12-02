import ALL_MAJORS from "../../../src/data/final_majors.json";

describe("DegreeSelect", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(".NewFlowDialog").contains("Continue").click().wait(300);
    cy.get('[role="tablist"]').contains("Degree").click();
  });
  it("Generates a new flow from majors", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering",
    );
    cy.get(".majors__add-button").click();
    cy.get(".DegreeSelect").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    const AA = ALL_MAJORS.find(
      m => m[0] === "Aeronautical and Astronautical Engineering",
    )[1];
    for (const course of AA) {
      cy.get(`[data-id="${course}"`);
    }
  });
  it("Adds a major", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering",
    );
    cy.get(".majors__add-button").click();
    cy.get(".majors__selected-list").contains(
      "Aeronautical and Astronautical Engineering",
    );
  });
  it("Deletes a major", () => {
    cy.get(".majors__select-input").select(
      "Aeronautical and Astronautical Engineering",
    );
    cy.get(".majors__add-button").click();
    cy.get(".majors__selected-list").contains(
      "Aeronautical and Astronautical Engineering",
    );
    cy.get(".majors__delete-button").click();
    cy.get(".majors__selected-list")
      .contains("Aeronautical and Astronautical Engineering")
      .should("not.exist");
  });
  it("Disables the add button when current selection already selected", () => {
    cy.get(".majors__add-button").click();
    cy.get(".majors__add-button").should("be.disabled");
    cy.get(".majors__select-input").select("Computer Engineering");
    cy.get(".majors__add-button").should("not.be.disabled");
  });
  it("Disables the add button when three majors are selected", () => {
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Mechanical Engineering");
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Computer Engineering");
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Electrical Engineering");
    cy.get(".majors__add-button").should("be.disabled");
  });
  it("Disables the Get courses button when no degrees are selected", () => {
    cy.get(".DegreeSelect").contains("Get courses").should("be.disabled");
    cy.get(".majors__add-button").click();
    cy.get(".DegreeSelect").contains("Get courses").should("not.be.disabled");
  });
  it("Persists state", () => {
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Electrical Engineering");
    cy.get(".majors__add-button").click();
    cy.get(".majors__select-input").select("Civil Engineering");
    cy.get(".AmbiguitySelect label").contains("Cautiously").click();
    cy.get(".CloseButton").click();
    cy.get(".Header").contains("New flow").click();
    cy.get(".DegreeSelect");
    cy.get("li").contains("Aeronautical and Astronautical Engineering");
    cy.get("li").contains("Electrical Engineering");
    cy.get(".majors__select-input")
      .find(":selected")
      .contains("Civil Engineering");
    cy.get('input[type="radio"][checked]').parent().contains("Cautiously");
  });
});
