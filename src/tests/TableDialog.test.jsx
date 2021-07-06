import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";

import {
  newApp,
  getNode,
  openDialog,
} from "./react-test-utils";
import { _testing } from "../components/dialogs/TableDialog";

const { COURSE_NUM_REGEX } = _testing;

describe("<TableDialog />", () => {
  it("Sorts courses by depth", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const dialog = document.querySelector(".TableDialog");
    userEvent.click(dialog.querySelector(".SortBy__radio-label--depth"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [
      ...tbody.querySelectorAll("tr > td:nth-child(1)")
    ].map(cell => cell.textContent);
    const sorted = courseIds.slice().sort((a, b) => a - b);
    expect(courseIds).to.eql(sorted);
  });
  it("Sorts courses by ID", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const dialog = document.querySelector(".TableDialog");
    userEvent.click(dialog.querySelector(".SortBy__radio-label--id"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [
      ...tbody.querySelectorAll("tr > td:nth-child(2)")
    ].map(cell => cell.textContent);
    const sorted = courseIds.slice().sort((a, b) => a.localeCompare(b));
    expect(courseIds).to.eql(sorted);
  });
  it("Sorts courses by ID number", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const dialog = document.querySelector(".TableDialog");
    userEvent.click(dialog.querySelector(".SortBy__radio-label--id-num"));
    const tbody = dialog.querySelector("tbody");
    const courseNums = [
      ...tbody.querySelectorAll("tr > td:nth-child(2)")
    ].map(cell => Number(cell.textContent.match(COURSE_NUM_REGEX)[0]));
    for (let i = 1; i < courseNums.length; i++) {
      expect(courseNums[i]).to.be.at.least(courseNums[i - 1]);
    }
  });
  it("Sorts courses by Name", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const dialog = document.querySelector(".TableDialog");
    userEvent.click(dialog.querySelector(".SortBy__radio-label--name"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [
      ...tbody.querySelectorAll("tr > td:nth-child(3)")
    ].map(cell => cell.textContent);
    const sorted = courseIds.slice().sort((a, b) => a.localeCompare(b));
    expect(courseIds).to.eql(sorted);
  });
  it("Deletes a course", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const tbody = document.querySelector(".TableDialog tbody");
    const originalNumRows = tbody.querySelectorAll("tr").length;
    userEvent.click(
      tbody.querySelector(".TableDialog__delete-btn")
    );
    const newNumRows = tbody.querySelectorAll("tr").length;
    expect(getNode("AMATH 301", container)).to.be.null;
    expect(newNumRows).to.eql(originalNumRows - 1);
  });
});
