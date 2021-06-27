import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";

import {
  newApp,
  getNode,
} from "./react-test-utils";

describe("<CourseNode />", () => {
  it("Displays tippy when hovered over", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    userEvent.hover(MATH_125);
    expect(document.querySelector(".tippy-box--flow")).to.not.be.null;
  });
  it("Highlights prerequisite course IDs", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    userEvent.hover(MATH_125);
    const tippy = document.querySelector(".tippy-box--flow");
    const mark = tippy.querySelector("mark");
    expect(mark).to.not.be.null;
    expect(mark.textContent).to.eql("MATH\u00A0124");
  });
  it("Highlights offered quarters", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    userEvent.hover(MATH_125);
    const tippy = document.querySelector(".tippy-box--flow");
    expect(tippy.querySelector("span.offered-autumn")).to.not.be.null;
    expect(tippy.querySelector("span.offered-winter")).to.not.be.null;
    expect(tippy.querySelector("span.offered-spring")).to.not.be.null;
    expect(tippy.querySelector("span.offered-summer")).to.not.be.null;
  });
});
