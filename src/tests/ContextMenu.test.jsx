/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
import { render } from "@testing-library/react";
import { expect } from "chai";

import {
  newApp,
  getNode,
  clickContextOption,
} from "./react-test-utils";

describe("<ContextMenu />", () => {
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
  it("Deletes a node", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Delete", MATH_125, container);
    expect(getNode("MATH 125", container)).to.be.null;
  });
});
// Alt + Click advance, Ctrl multiselect, edge selection all fail
// Is it WTR, RTL, or something else? TODO: Try Jest instead
