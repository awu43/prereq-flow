/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-undef */
import {
  render,
  screen,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";

import {
  newApp,
  getNode,
  clickContextOption,
} from "./react-test-utils";

describe("<EditDataDialog />", () => {
  it("Disables save button when ID field is empty", () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Edit data", MATH_125, container);
    const dialog = document.querySelector(".EditDataDialog");
    const idInput = within(dialog).getByDisplayValue("MATH 125");
    userEvent.clear(idInput);
    const saveButton = within(dialog).getByText("Save");
    expect(saveButton.getAttribute("disabled")).to.not.be.null;
  });
  it("Shows error and disables save button when ID already exists", async () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Edit data", MATH_125, container);
    const dialog = document.querySelector(".EditDataDialog");
    const idInput = within(dialog).getByDisplayValue("MATH 125");
    userEvent.clear(idInput);
    userEvent.type(idInput, "MATH 126");
    const errorMsg = await screen.findByText("ID already in use");
    expect(errorMsg).to.not.be.null;
    const saveButton = within(dialog).getByText("Save");
    expect(saveButton.getAttribute("disabled")).to.not.be.null;
  });
  it("Saves new course ID", async () => {
    const { container } = render(newApp());
    const MATH_125 = getNode("MATH 125", container);
    clickContextOption("Edit data", MATH_125, container);
    const dialog = document.querySelector(".EditDataDialog");
    const idInput = within(dialog).getByDisplayValue("MATH 125");
    userEvent.clear(idInput);
    userEvent.type(idInput, "FOO 123");
    const saveButton = within(dialog).getByText("Save");
    userEvent.click(saveButton);
    await waitForElementToBeRemoved(() => (
      document.querySelector(".EditDataDialog")
    ));
    expect(getNode("MATH 125", container)).to.be.null;
    expect(getNode("FOO 123", container)).to.not.be.null;
  });
});