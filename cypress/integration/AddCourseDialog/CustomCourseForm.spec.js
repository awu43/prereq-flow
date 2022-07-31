describe("CustomCourseForm", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("Add courses").click();
    cy.get('[role="tablist"]').contains("Custom course").click();
  });
  it("Adds a custom course", () => {
    cy.get(".CustomCourseForm__id-input").type("FOO 123");
    cy.get(".CustomCourseForm__add-button").click();
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".AddCourseDialog").should("not.exist");
    cy.get('[data-id="FOO 123"]');
  });
  it("Disables the add button when ID field is empty or whitespace", () => {
    cy.get(".CustomCourseForm__id-input").clear();
    cy.get(".CustomCourseForm__add-button").should("be.disabled");
    cy.get(".CustomCourseForm__id-input").type("   ");
    cy.get(".CustomCourseForm__add-button").should("be.disabled");
  });
  it("Displays an error message when ID field matches existing course", () => {
    cy.get(".CustomCourseForm__id-input").type("MATH 124");
    cy.get(".tippy-box--error");
  });
  it("Persists state", () => {
    cy.get(".CustomCourseForm__id-input").type("WEB 101");
    cy.get(".CustomCourseForm__name-input").type(
      "Introduction to Web Development",
    );
    cy.get(".AddCourseDialog .CloseButton").click();
    cy.get(".Header").contains("Add courses").click();
    cy.get(".CustomCourseForm__id-input").should("have.value", "WEB 101");
    cy.get(".CustomCourseForm__name-input").should(
      "have.value",
      "Introduction to Web Development",
    );
  });
});
