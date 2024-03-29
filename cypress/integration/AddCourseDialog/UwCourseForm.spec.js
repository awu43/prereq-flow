describe("UwCourseForm", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
    cy.get(".Header").contains("Add courses").click();
    cy.get('[role="tablist"]').contains("UW course").click();
  });
  it("Adds a UW course", () => {
    cy.get(".UwCourseForm__searchbar").type("CHEM 110");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
  });
  it("Disables add button when searchbar is empty or whitespace", () => {
    cy.get(".UwCourseForm__add-button").should("be.disabled");
    cy.get(".UwCourseForm__searchbar").type("   ");
    cy.get(".UwCourseForm__add-button").should("be.disabled");
  });
  it("Displays an error message when no course ID found", () => {
    cy.get(".UwCourseForm__searchbar").type("not a valid course search");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".tippy-box--error");
  });
  it("Displays an error message when course already exists", () => {
    cy.get(".UwCourseForm__searchbar").type("MATH 124");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".tippy-box--error");
  });
  it("Returns focus to searchbar after searching", () => {
    cy.get(".UwCourseForm__searchbar").type("CHEM 110");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".UwCourseForm__searchbar").should("be.focused");
  });
  it("Connects a UW course to existing prereqs", () => {
    cy.get('[data-cy="uw-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-prereqs"]').check();
    cy.get(".UwCourseForm__searchbar").type("CHEM 162");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 162"]');
    cy.get('[data-testid="CHEM 152 -> CHEM 162"]');
  });
  it("Does not connect a UW course to existing prereqs", () => {
    cy.get('[data-cy="uw-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').uncheck();
    cy.get(".UwCourseForm__searchbar").type("CHEM 162");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 162"]');
    cy.get('[data-testid="CHEM 152 -> CHEM 162"]').should("not.exist");
  });
  it("Connects a UW course to existing postreqs", () => {
    cy.get('[data-cy="uw-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').check();
    cy.get(".UwCourseForm__searchbar").type("CHEM 110");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
    cy.get('[data-testid="CHEM 110 -> CHEM 142"]');
  });
  it("Does not connect a UW course to existing postreqs", () => {
    cy.get('[data-cy="uw-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').uncheck();
    cy.get(".UwCourseForm__searchbar").type("CHEM 110");
    cy.get(".UwCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="CHEM 110"]');
    cy.get('[data-testid="CHEM 110 -> CHEM 142"]').should("not.exist");
  });
  it("Persists state", () => {
    cy.get('[data-cy="uw-connect-to-prereqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').uncheck();
    cy.get('[data-cy="uw-connect-to-postreqs"]').check();
    cy.get(".UwCourseForm__searchbar").type("CHEM 110");
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".Header").contains("Add courses").click();
    cy.get(".UwCourseForm__searchbar").should("have.value", "CHEM 110");
    cy.get('input[type="checkbox"][checked]')
      .parent()
      .contains("Connect to existing postreqs");
  });
});
