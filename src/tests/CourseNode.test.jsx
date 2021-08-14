import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";

import { newApp, getNode } from "./react-test-utils";

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
    const span = tippy.querySelector(".uw-course-id--highlighted");
    expect(span).to.not.be.null;
    expect(span.textContent).to.eql("MATH 124");
  });
  it("Highlights offered quarters", async () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    userEvent.hover(MATH_125);
    await waitFor(() => {
      expect(document.querySelector('.tippy-box--flow[data-state="visible"]'))
        .to.not.be.null;
    });
    // Wait for tippy to appear
    const tippy = document.querySelector(
      '.tippy-box--flow[data-state="visible"]',
    );
    expect(tippy.querySelector("span.offered-autumn")).to.not.be.null;
    expect(tippy.querySelector("span.offered-winter")).to.not.be.null;
    expect(tippy.querySelector("span.offered-spring")).to.not.be.null;
    expect(tippy.querySelector("span.offered-summer")).to.not.be.null;
  });
});
