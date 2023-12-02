import { getNode } from "../utils";

describe("CourseNode", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
  });
  describe("tippy", () => {
    beforeEach(() => {
      getNode("MATH 125").trigger("mouseenter");
    });
    it("Appears when node is hovered over", () => {
      cy.get(".tippy-box--flow");
    });
    it("Highlights prerequisite course IDs", () => {
      cy.get(".tippy-box--flow .uw-course-id--highlighted").should(
        "have.text",
        "MATH 124",
      );
    });
    it("Highlights offered quarters", () => {
      cy.get(".tippy-box--flow span.offered-autumn");
      cy.get(".tippy-box--flow span.offered-winter");
      cy.get(".tippy-box--flow span.offered-spring");
      cy.get(".tippy-box--flow span.offered-summer");
    });
  });
  it("Advances status on Alt + click", () => {
    getNode("MATH 124").should("have.class", "ready");
    getNode("MATH 124").click({ altKey: true });
    getNode("MATH 124").should("have.class", "enrolled");
  });
  it("Is multiselected with Ctrl + click", () => {
    getNode("MATH 124").trigger("keydown", { key: "Control" });
    cy.get(".react-flow__node.selected").should("have.length", 0);
    getNode("MATH 124").click();
    getNode("MATH 125").click();
    cy.get(".react-flow__node.selected").should("have.length", 2);
  });
});
