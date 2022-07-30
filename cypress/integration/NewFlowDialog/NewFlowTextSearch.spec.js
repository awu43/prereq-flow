describe("NewFlowTextSearch", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".Header").contains("New flow").click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.get(".NewFlowDialog").contains("Continue").click().wait(300);
    cy.get('[role="tablist"]').contains("Text search").click();
  });
  it("Generates a new flow from text search", () => {
    cy.get('[role="tablist"]').contains("Blank").click();
    cy.get(".NewBlankFlow button").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get(".Header").contains("New flow").click();
    cy.get('[role="tablist"]').contains("Text search").click();

    cy.get(".NewFlowTextSearch__textarea").type("MATH 124, MATH 125, MATH 126");
    cy.get(".NewFlowTextSearch").contains("Get courses").click();
    cy.get(".NewFlowDialog").should("not.exist");
    cy.get('[data-id="MATH 124"]');
    cy.get('[data-id="MATH 125"]');
    cy.get('[data-id="MATH 126"]');
  });
  it("Disables Get courses button when textarea is empty or whitespace", () => {
    cy.get(".NewFlowTextSearch").contains("Get courses").should("be.disabled");
    cy.get(".NewFlowTextSearch__textarea").type("   ");
    cy.get(".NewFlowTextSearch").contains("Get courses").should("be.disabled");
  });
  it("Displays an error message when no course IDs found", () => {
    cy.get(".NewFlowTextSearch__textarea").clear();
    cy.get(".NewFlowTextSearch__textarea").type("String with no courses");
    cy.get(".NewFlowTextSearch").contains("Get courses").click();
    cy.get(".tippy-box--error");
  });
  it("Persists state", () => {
    cy.get(".NewFlowTextSearch__textarea").type("FooBar Baz");
    cy.get(".NewFlowTextSearch .AmbiguitySelect label")
      .contains("Cautiously")
      .click();
    cy.get(".CloseButton").click();
    cy.get(".Header").contains("New flow").click();
    cy.get(".NewFlowTextSearch__textarea").contains("FooBar Baz");
    cy.get('input[type="radio"][checked]').parent().contains("Cautiously");
  });
});
