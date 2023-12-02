import {
  getNode,
  clickNodeContextOpt,
  getByTestId,
  getEdge,
  deleteEdge,
  clickContextOption,
  deleteNode,
} from "../utils";

const TEST_COND_IDS = {
  OR1: "OR-NcdJvmIRQoGpbDutNlZki", // -> M E 373
  OR2: "OR-VXfYd0P7Ad4ZZRmehvO_9", // -> M E 395
};

describe("ContextMenu", () => {
  beforeEach(() => {
    cy.setCookie("archive-notice-seen", "true");
    cy.visit("/");
  });
  describe("Node", () => {
    it("Sets a single course status to enrolled", () => {
      clickNodeContextOpt("MATH 124", "Enrolled");
      getNode("MATH 124").should("have.class", "enrolled");
      getNode("MATH 125").should("have.class", "under-one-away");
      getNode("PHYS 121").should("have.class", "ready");
    });
    it("Sets a single course status to completed", () => {
      clickNodeContextOpt("MATH 124", "Completed");
      getNode("MATH 124").should("have.class", "completed");
      getNode("MATH 125").should("have.class", "ready");
      getNode("PHYS 121").should("have.class", "ready");
    });
    it("Reroutes an OR node", () => {
      clickNodeContextOpt(TEST_COND_IDS.OR1, "Reroute");
      getNode(TEST_COND_IDS.OR1).should("not.exist");
      getByTestId("MATH 208 -> M E 373");
      getByTestId("AMATH 352 -> M E 373");
    });
    it("Reroutes all pointless OR nodes", () => {
      deleteEdge("AMATH 352", TEST_COND_IDS.OR1);
      deleteEdge("IND E 315", TEST_COND_IDS.OR2);
      clickNodeContextOpt(TEST_COND_IDS.OR1, "Reroute pointless OR nodes");
      cy.get(TEST_COND_IDS.OR1).should("not.exist");
      cy.get(TEST_COND_IDS.OR2).should("not.exist");
      getByTestId("MATH 208 -> M E 373");
      getByTestId("STAT 390 -> M E 395");
    });
    it("Disconnects from prereqs", () => {
      clickNodeContextOpt("PHYS 122", "Disconnect prereqs");
      getByTestId("PHYS 121 -> PHYS 122").should("not.exist");
      getByTestId("MATH 125 -> PHYS 122").should("not.exist");
    });
    it("Disconnects from postreqs", () => {
      clickNodeContextOpt("PHYS 122", "Disconnect postreqs");
      getByTestId("PHYS 122 -> PHYS 123").should("not.exist");
      getByTestId("PHYS 122 -> E E 215").should("not.exist");
    });
    it("Disconnects all", () => {
      clickNodeContextOpt("PHYS 122", "Disconnect all");
      getByTestId("PHYS 121 -> PHYS 122").should("not.exist");
      getByTestId("MATH 125 -> PHYS 122").should("not.exist");
      getByTestId("PHYS 122 -> PHYS 123").should("not.exist");
      getByTestId("PHYS 122 -> E E 215").should("not.exist");
    });
    it("Connects to prereqs", () => {
      deleteEdge("PHYS 121", "A A 210");
      deleteEdge("MATH 126", "A A 210");
      getEdge("PHYS 121", "A A 210").should("not.exist");
      getEdge("MATH 126", "A A 210").should("not.exist");
      clickNodeContextOpt("A A 210", "Connect prereqs");
      getEdge("PHYS 121", "A A 210");
      getEdge("MATH 126", "A A 210");
    });
    it("Connects to postreqs", () => {
      deleteEdge("A A 210", "CEE 220");
      deleteEdge("A A 210", "M E 230");
      getEdge("A A 210", "CEE 220").should("not.exist");
      getEdge("A A 210", "M E 230").should("not.exist");
      clickNodeContextOpt("A A 210", "Connect postreqs");
      getEdge("A A 210", "CEE 220");
      getEdge("A A 210", "M E 230");
    });
    it("Connects to all", () => {
      deleteEdge("PHYS 121", "A A 210");
      deleteEdge("MATH 126", "A A 210");
      deleteEdge("A A 210", "CEE 220");
      deleteEdge("A A 210", "M E 230");
      getEdge("PHYS 121", "A A 210").should("not.exist");
      getEdge("MATH 126", "A A 210").should("not.exist");
      getEdge("A A 210", "CEE 220").should("not.exist");
      getEdge("A A 210", "M E 230").should("not.exist");
      clickNodeContextOpt("A A 210", "Connect all");
      getEdge("PHYS 121", "A A 210");
      getEdge("MATH 126", "A A 210");
      getEdge("A A 210", "CEE 220");
      getEdge("A A 210", "M E 230");
    });
    it("Deletes a node", () => {
      deleteNode("M E 230");
      getNode("M E 230").should("not.exist");
      getEdge("A A 210 -> M E 230").should("not.exist");
      getEdge("M E 230 -> M E 373").should("not.exist");
    });
    it("Displays a link to MyPlan for course nodes", () => {
      getNode("MATH 125").rightclick();
      cy.get(".ContextMenu")
        .contains("Open in MyPlan")
        .should(
          "have.attr",
          "href",
          "https://myplan.uw.edu/course/#/courses/MATH 125",
        );
      getNode(TEST_COND_IDS.OR1).rightclick();
      cy.get(".ContextMenu").contains("Open in MyPlan").should("not.exist");
    });
  });

  describe("Edge", () => {
    it("Toggles edge concurrency", () => {
      getEdge("MATH 124", "PHYS 121").siblings().contains("CC");
      getEdge("MATH 124", "PHYS 121").rightclick({ force: true });
      clickContextOption("Concurrent");
      getEdge("MATH 124", "PHYS 121")
        .siblings()
        .contains("CC")
        .should("not.exist");
    });
    it("Deletes an edge", () => {
      deleteEdge("MATH 125", "MATH 126");
    });
  });

  describe("Pane", () => {
    it("Creates a new OR node", () => {
      cy.get('[data-id^="OR"]').then(j => {
        cy.get(".react-flow__pane").rightclick({ force: true });
        clickContextOption("New OR node");
        cy.get('[data-id^="OR"]').should("have.length", j.length + 1);
      });
    });
    it("Creates a new AND node", () => {
      cy.get('[data-id^="AND"]').then(j => {
        cy.get(".react-flow__pane").rightclick({ force: true });
        clickContextOption("New AND node");
        cy.get('[data-id^="AND"]').should("have.length", j.length + 1);
      });
    });
    it("Reroutes all pointless OR nodes", () => {
      deleteNode("AMATH 352");
      deleteNode("STAT 390");
      cy.get(".react-flow__pane").rightclick({ force: true });
      clickContextOption("Reroute pointless OR nodes");
      cy.get(TEST_COND_IDS.OR1).should("not.exist");
      cy.get(TEST_COND_IDS.OR2).should("not.exist");
      getByTestId("MATH 208 -> M E 373");
      getByTestId("IND E 315 -> M E 395");
    });
  });
});
