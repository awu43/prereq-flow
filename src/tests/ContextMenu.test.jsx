import { render } from "@testing-library/react";
import { expect } from "chai";

import {
  newApp,
  getNode,
  clickContextOption,
} from "./react-test-utils";
import { TEST_COND_IDS } from "./test-utils";

function deleteFromContext(contextTarget, container) {
  clickContextOption("Delete", contextTarget, container);
}

describe("<ContextMenu />", () => {
  /* Node */
  it("Sets a single course status to enrolled", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Enrolled", MATH_125, container);
    expect([...MATH_125.classList]).to.include("enrolled");
  });
  it("Sets a single course status to completed", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Completed", MATH_125, container);
    expect([...MATH_125.classList]).to.include("completed");
  });
  it("Reroutes an OR node", () => {
    const { container, queryByTestId } = render(newApp());
    const orNode = getNode(TEST_COND_IDS.OR1, container);
    clickContextOption("Reroute", orNode, container);
    expect(getNode(TEST_COND_IDS.OR1, container)).to.be.null;
    expect(queryByTestId("MATH 125 -> AMATH 301")).to.not.be.null;
    expect(queryByTestId("MATH 135 -> AMATH 301")).to.not.be.null;
  });
  it("Reroutes all pointless OR nodes (node)", () => {
    const { container, queryByTestId } = render(newApp());
    deleteFromContext(getNode("MATH 135", container), container);
    deleteFromContext(getNode(TEST_COND_IDS.AND1, container), container);
    clickContextOption(
      "Reroute pointless OR nodes",
      getNode(TEST_COND_IDS.OR1, container),
      container
    );
    expect(getNode(TEST_COND_IDS.OR1, container)).to.be.null;
    expect(queryByTestId("MATH 125 -> AMATH 301")).to.not.be.null;
    expect(getNode(TEST_COND_IDS.OR2, container)).to.be.null;
    expect(queryByTestId("MATH 136 -> MATH 309")).to.not.be.null;
  });
  it("Disconnects from prereqs", () => {
    const { container, queryByTestId } = render(newApp());
    expect(queryByTestId("MATH 125 -> MATH 126")).to.not.be.null;
    clickContextOption(
      "Disconnect prereqs", getNode("MATH 126", container), container
    );
    expect(queryByTestId("MATH 125 -> MATH 126")).to.be.null;
  });
  it("Disconnects from postreqs", () => {
    const { container, queryByTestId } = render(newApp());
    expect(queryByTestId("MATH 126 -> MATH 308")).to.not.be.null;
    clickContextOption(
      "Disconnect postreqs", getNode("MATH 126", container), container
    );
    expect(queryByTestId("MATH 126 -> MATH 308")).to.be.null;
  });
  it("Disconnects all", () => {
    const { container, queryByTestId } = render(newApp());
    expect(queryByTestId("MATH 125 -> MATH 126")).to.not.be.null;
    expect(queryByTestId("MATH 126 -> MATH 308")).to.not.be.null;
    clickContextOption(
      "Disconnect all", getNode("MATH 126", container), container
    );
    expect(queryByTestId("MATH 125 -> MATH 126")).to.be.null;
    expect(queryByTestId("MATH 126 -> MATH 308")).to.be.null;
  });
  it("Connects to prereqs", () => {
    const { container, queryByTestId } = render(newApp());
    deleteFromContext(getNode(TEST_COND_IDS.AND1, container), container);
    deleteFromContext(getNode(TEST_COND_IDS.OR2, container), container);
    expect(queryByTestId("MATH 307 -> MATH 309")).to.be.null;
    expect(queryByTestId("MATH 308 -> MATH 309")).to.be.null;
    expect(queryByTestId("MATH 136 -> MATH 309")).to.be.null;
    clickContextOption(
      "Connect prereqs", getNode("MATH 309", container), container
    );
    expect(queryByTestId("MATH 307 -> MATH 309")).to.not.be.null;
    expect(queryByTestId("MATH 308 -> MATH 309")).to.not.be.null;
    expect(queryByTestId("MATH 136 -> MATH 309")).to.not.be.null;
  });
  it("Connects to postreqs", () => {
    const { container, queryByTestId } = render(newApp());
    deleteFromContext(getNode(TEST_COND_IDS.OR1, container), container);
    deleteFromContext(queryByTestId("MATH 125 -> MATH 307"), container);
    deleteFromContext(queryByTestId("MATH 125 -> MATH 126"), container);
    expect(queryByTestId("MATH 125 -> MATH 307")).to.be.null;
    expect(queryByTestId("MATH 125 -> AMATH 301")).to.be.null;
    expect(queryByTestId("MATH 125 -> MATH 126")).to.be.null;
    clickContextOption(
      "Connect postreqs", getNode("MATH 125", container), container
    );
    expect(queryByTestId("MATH 125 -> MATH 307")).to.not.be.null;
    expect(queryByTestId("MATH 125 -> AMATH 301")).to.not.be.null;
    expect(queryByTestId("MATH 125 -> MATH 126")).to.not.be.null;
  });
  it("Connects to all", () => {
    const { container, queryByTestId } = render(newApp());
    clickContextOption(
      "Disconnect all", getNode("MATH 126", container), container
    );
    expect(queryByTestId("MATH 125 -> MATH 126")).to.be.null;
    expect(queryByTestId("MATH 126 -> MATH 308")).to.be.null;
    clickContextOption(
      "Connect all", getNode("MATH 126", container), container
    );
    expect(queryByTestId("MATH 125 -> MATH 126")).to.not.be.null;
    expect(queryByTestId("MATH 126 -> MATH 308")).to.not.be.null;
  });
  it("Deletes a node", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    deleteFromContext(MATH_125, container);
    expect(getNode("MATH 125", container)).to.be.null;
  });

  /* Edge */
  it("Toggles edge concurrency", () => {
    const { container, getByTestId } = render(newApp());
    const edge = getByTestId("MATH 125 -> MATH 126");
    const edgeContainer = edge.parentElement;
    expect(edgeContainer.querySelector(".react-flow__edge-textwrapper"))
      .to.be.null;
    clickContextOption("Concurrent", edge, container);
    expect(edgeContainer.querySelector(".react-flow__edge-textwrapper"))
      .to.not.be.null;
    clickContextOption("Concurrent", edge, container);
    expect(edgeContainer.querySelector(".react-flow__edge-textwrapper"))
      .to.be.null;
  });
  it("Deletes an edge", () => {
    const { container, queryByTestId } = render(newApp());
    const edge = queryByTestId("MATH 125 -> MATH 126");
    deleteFromContext(edge, container);
    expect(queryByTestId("MATH 125 -> MATH 126")).to.be.null;
  });

  /* Pane */
  it("Creates a new OR node", () => {
    const { container } = render(newApp([]));
    const pane = container.querySelector(".react-flow__pane");
    clickContextOption("New OR node", pane, container);
    expect(container.querySelector(".OrNode")).to.not.be.null;
  });
  it("Creates a new AND node", () => {
    const { container } = render(newApp([]));
    const pane = container.querySelector(".react-flow__pane");
    clickContextOption("New AND node", pane, container);
    expect(container.querySelector(".AndNode")).to.not.be.null;
  });
  it("Reroutes all pointless OR nodes (pane)", () => {
    const { container, queryByTestId } = render(newApp());
    deleteFromContext(getNode("MATH 135", container), container);
    deleteFromContext(getNode(TEST_COND_IDS.AND1, container), container);
    clickContextOption(
      "Reroute pointless OR nodes",
      container.querySelector(".react-flow__pane"),
      container
    );
    expect(getNode(TEST_COND_IDS.OR1, container)).to.be.null;
    expect(queryByTestId("MATH 125 -> AMATH 301")).to.not.be.null;
    expect(getNode(TEST_COND_IDS.OR2, container)).to.be.null;
    expect(queryByTestId("MATH 136 -> MATH 309")).to.not.be.null;
  });
});
// Alt + Click advance and Ctrl multiselect fail
// Is it WTR, RTL, or something else?
