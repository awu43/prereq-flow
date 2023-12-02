describe("AddCourseTextSearch", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
    cy.get(".Header").contains("Add courses").click();
    cy.get('[role="tablist"]').contains("Text search").click();
  });
  it("Adds courses", () => {
    cy.get(".AddCourseTextSearch__textarea").type("CHEM 110, CHEM 162");
    cy.get(".AddCourseTextSearch").contains("Add courses").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
    cy.get('[data-id="CHEM 162"]');
  });
  it("Disables Get courses button when textarea is empty or whitespace", () => {
    cy.get(".AddCourseTextSearch__add-courses-button").should("be.disabled");
    cy.get(".AddCourseTextSearch__textarea").type("   ");
    cy.get(".AddCourseTextSearch__add-courses-button").should("be.disabled");
  });
  it("Displays an error message when no course IDs found", () => {
    cy.get(".AddCourseTextSearch__textarea").clear();
    cy.get(".AddCourseTextSearch__textarea").type("String with no courses");
    cy.get(".AddCourseTextSearch").contains("Add courses").click();
    cy.get(".tippy-box--error");
  });
  it("Connects courses to existing prereqs", () => {
    cy.get('[data-cy="text-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-prereqs"]').check();
    cy.get(".AddCourseTextSearch__textarea").type("CHEM 162");
    cy.get(".AddCourseTextSearch__add-courses-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 162"]');
    cy.get('[data-testid="CHEM 152 -> CHEM 162"]');
  });
  it("Does not connect courses to existing prereqs", () => {
    cy.get('[data-cy="text-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').uncheck();
    cy.get(".AddCourseTextSearch__textarea").type("CHEM 162");
    cy.get(".AddCourseTextSearch__add-courses-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 162"]');
    cy.get('[data-testid="CHEM 152 -> CHEM 162"]').should("not.exist");
  });
  it("Connects courses to existing postreqs", () => {
    cy.get('[data-cy="text-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').check();
    cy.get(".AddCourseTextSearch__textarea").type("CHEM 110");
    cy.get(".AddCourseTextSearch__add-courses-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
    cy.get('[data-testid="CHEM 110 -> CHEM 142"]');
  });
  it("Does not connect courses to existing postreqs", () => {
    cy.get('[data-cy="text-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').uncheck();
    cy.get(".AddCourseTextSearch__textarea").type("CHEM 110");
    cy.get(".AddCourseTextSearch__add-courses-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
    cy.get('[data-testid="CHEM 110 -> CHEM 142"]').should("not.exist");
  });
  it("Persists state", () => {
    cy.get(".AddCourseTextSearch__textarea").type("FOOBAR BAZ");
    cy.get('[data-cy="text-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="text-connect-to-postreqs"]').check();
    cy.get(".CloseButton").click();
    cy.get(".Header").contains("Add courses").click();
    cy.get(".AddCourseTextSearch__textarea").should("have.value", "FOOBAR BAZ");
    cy.get('input[type="checkbox"][checked]')
      .parent()
      .contains("Connect to existing postreqs");
  });
});
