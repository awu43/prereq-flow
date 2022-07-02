import { getNode } from "../utils";

describe("TableDialog", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.get(".TableDialog__open-btn").click();
  });
  it("Sorts courses by depth", () => {
    cy.get(".SortBy__radio-label--depth input").click();
    cy.get(".TableDialog tbody tr > td:nth-child(1)").then(jElems => {
      const depths = [];
      for (const elem of jElems) {
        depths.push(Number(elem.textContent));
      }
      expect(depths).to.eql(depths.slice().sort((a, b) => a - b));
    });
  });
  it("Sorts courses by ID", () => {
    cy.get(".SortBy__radio-label--id input").click();
    cy.get(".TableDialog tbody tr > td:nth-child(2)").then(jElems => {
      const ids = [];
      for (const elem of jElems) {
        ids.push(elem.textContent);
      }
      expect(ids).to.eql(ids.slice().sort((a, b) => a.localeCompare(b)));
    });
  });
  it("Sorts courses by ID number", () => {
    cy.get(".SortBy__radio-label--id-num input").click();
    cy.get(".TableDialog tbody tr > td:nth-child(2)").then(jElems => {
      const idNums = [];
      for (const elem of jElems) {
        idNums.push(Number(elem.textContent.match(/\b\d{3}\b/)[0]));
        // COURSE_NUM_REGEX from TableDialog
      }
      expect(idNums).to.eql(idNums.slice().sort((a, b) => a - b));
    });
  });
  it("Sorts courses by Name", () => {
    cy.get(".SortBy__radio-label--name input").click();
    cy.get(".TableDialog tbody tr > td:nth-child(3)").then(jElems => {
      const names = [];
      for (const elem of jElems) {
        names.push(elem.textContent);
      }
      expect(names).to.eql(names.slice().sort((a, b) => a.localeCompare(b)));
    });
  });
  it("Links ID column to MyPlan", () => {
    cy.get(".TableDialog tbody tr:nth-child(4) td:nth-child(2)")
      .contains("AMATH 352")
      .should(
        "have.attr",
        "href",
        "https://myplan.uw.edu/course/#/courses/AMATH 352",
      );
  });
  it("Links Prerequisite column to MyPlan", () => {
    cy.get(".TableDialog tbody tr:nth-child(4) td:nth-child(4)")
      .contains("MATH 126")
      .should(
        "have.attr",
        "href",
        "https://myplan.uw.edu/course/#/courses/MATH 126",
      );
    cy.get(".TableDialog tbody tr:nth-child(4) td:nth-child(4)")
      .contains("MATH 136")
      .should(
        "have.attr",
        "href",
        "https://myplan.uw.edu/course/#/courses/MATH 136",
      );
  });
  it("Deletes a course from the Incoming column", () => {
    cy.get(".TableDialog tbody tr").then(origRows => {
      cy.get(
        ".TableDialog tbody tr:nth-child(4) td:nth-child(6) button",
      ).click();
      cy.get(".TableDialog tbody tr").should(
        "have.length",
        origRows.length - 1,
      );
      getNode("MATH 126").should("not.exist");
    });
  });
  it("Links Incoming column to MyPlan", () => {
    cy.get(".TableDialog tbody tr:nth-child(4) td:nth-child(6)")
      .contains("MATH 126")
      .should(
        "have.attr",
        "href",
        "https://myplan.uw.edu/course/#/courses/MATH 126",
      );
  });
  it("Deletes a course from the Outgoing column", () => {
    cy.get(".TableDialog tbody tr").then(origRows => {
      cy.get(
        ".TableDialog tbody tr:nth-child(4) td:nth-child(7) button",
      ).click();
      cy.get(".TableDialog tbody tr").should(
        "have.length",
        origRows.length - 1,
      );
      getNode("M E 373").should("not.exist");
    });
  });
  it("Links Outgoing column to MyPlan", () => {
    cy.get(".TableDialog tbody tr:nth-child(4) td:nth-child(7)")
      .contains("M E 373")
      .should(
        "have.attr",
        "href",
        "https://myplan.uw.edu/course/#/courses/M E 373",
      );
  });
  it("Deletes a course from the Delete column", () => {
    cy.get(".TableDialog tbody tr").then(origRows => {
      cy.get(
        ".TableDialog tbody tr:nth-child(4) td:nth-child(8) button",
      ).click();
      cy.get(".TableDialog tbody tr").should(
        "have.length",
        origRows.length - 1,
      );
      getNode("AMATH 352").should("not.exist");
    });
  });
});
