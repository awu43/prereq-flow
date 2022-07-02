import { clickNodeContextOpt, getEdge, getNode } from "../utils";

describe("EditDataDialog", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Disables save button when ID field is empty", () => {
    clickNodeContextOpt("MATH 125", "Edit data");
    cy.get(".EditDataDialog")
      .contains("Save")
      .should("not.have.attr", "disabled");
    cy.get(".EditDataDialog .EditDataForm__id-input").clear();
    cy.get(".EditDataDialog").contains("Save").should("have.attr", "disabled");
  });

  it("Shows error and disables save button when ID already exists", () => {
    clickNodeContextOpt("MATH 125", "Edit data");
    cy.get(".EditDataDialog")
      .contains("Save")
      .should("not.have.attr", "disabled");
    cy.get(".EditDataDialog .EditDataForm__id-input").clear();
    cy.get(".EditDataDialog .EditDataForm__id-input").type("MATH 124");
    cy.get(".tippy-box").contains("ID already in use");
  });
  it("Saves new course ID", () => {
    clickNodeContextOpt("MSE 170", "Edit data");
    cy.get(".EditDataDialog .EditDataForm__id-input").clear();
    cy.get(".EditDataDialog .EditDataForm__id-input").type("FOO 123");
    cy.get(".EditDataDialog").contains("Save").click();
    getNode("MSE 170").should("not.exist");
    getEdge("CHEM 142", "MSE 170").should("not.exist");
    getEdge("MSE 170", "M E 354").should("not.exist");
    getNode("FOO 123");
    getEdge("CHEM 142", "FOO 123");
    getEdge("FOO 123", "M E 354");
  });
});
