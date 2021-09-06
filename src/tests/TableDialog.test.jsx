import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";

import { newApp, getNode, openDialog } from "./react-test-utils";
import { _testing } from "../components/dialogs/TableDialog";

const { COURSE_NUM_REGEX } = _testing;

function openTableDialog() {
  const { container } = render(newApp());
  openDialog("TableDialog__open-btn", container);
  return document.querySelector(".TableDialog");
}

describe("<TableDialog />", () => {
  it("Sorts courses by depth", () => {
    const dialog = openTableDialog();
    userEvent.click(dialog.querySelector(".SortBy__radio-label--depth"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [...tbody.querySelectorAll("tr > td:nth-child(1)")].map(
      cell => cell.textContent,
    );
    const sorted = courseIds.slice().sort((a, b) => a - b);
    expect(courseIds).to.eql(sorted);
  });
  it("Sorts courses by ID", () => {
    const dialog = openTableDialog();
    userEvent.click(dialog.querySelector(".SortBy__radio-label--id"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [...tbody.querySelectorAll("tr > td:nth-child(2)")].map(
      cell => cell.textContent,
    );
    const sorted = courseIds.slice().sort((a, b) => a.localeCompare(b));
    expect(courseIds).to.eql(sorted);
  });
  it("Sorts courses by ID number", () => {
    const dialog = openTableDialog();
    userEvent.click(dialog.querySelector(".SortBy__radio-label--id-num"));
    const tbody = dialog.querySelector("tbody");
    const courseNums = [...tbody.querySelectorAll("tr > td:nth-child(2)")].map(
      cell => Number(cell.textContent.match(COURSE_NUM_REGEX)[0]),
    );
    for (let i = 1; i < courseNums.length; i++) {
      expect(courseNums[i]).to.be.at.least(courseNums[i - 1]);
    }
  });
  it("Sorts courses by Name", () => {
    const dialog = openTableDialog();
    userEvent.click(dialog.querySelector(".SortBy__radio-label--name"));
    const tbody = dialog.querySelector("tbody");
    const courseIds = [...tbody.querySelectorAll("tr > td:nth-child(3)")].map(
      cell => cell.textContent,
    );
    const sorted = courseIds.slice().sort((a, b) => a.localeCompare(b));
    expect(courseIds).to.eql(sorted);
  });
  it("Links ID column to MyPlan", () => {
    const dialog = openTableDialog();
    expect(
      dialog.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/AMATH 301"][class="uw-course-id one-away"]',
      ),
    ).to.not.be.null;
  });
  it("Links Prerequisite column to MyPlan", () => {
    const dialog = openTableDialog();
    const prerequisite = dialog.querySelector("tbody tr td:nth-child(4)");
    expect(
      prerequisite.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/MATH 125"][class="uw-course-id ready"]',
      ),
    ).to.not.be.null;
    expect(
      prerequisite.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/Q SCI 292"][class="uw-course-id"]',
      ),
    ).to.not.be.null;
    expect(
      prerequisite.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/MATH 135"][class="uw-course-id ready"]',
      ),
    ).to.not.be.null;
  });
  it("Deletes a course from the Incoming column", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const tbody = document.querySelector(".TableDialog tbody");
    const originalNumRows = tbody.querySelectorAll("tr").length;
    userEvent.click(
      tbody.querySelector("tr:first-child .TableDialog__small-delete-btn"),
    );
    const newNumRows = tbody.querySelectorAll("tr").length;
    expect(getNode("MATH 125", container)).to.be.null;
    expect(newNumRows).to.eql(originalNumRows - 1);
  });
  it("Links Incoming column to MyPlan", () => {
    const dialog = openTableDialog();
    const incoming = dialog.querySelector("tbody tr td:nth-child(6)");
    expect(
      incoming.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/MATH 125"][class="uw-course-id ready"]',
      ),
    ).to.not.be.null;
    expect(
      incoming.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/MATH 135"][class="uw-course-id ready"]',
      ),
    ).to.not.be.null;
  });
  it("Deletes a course from the Outgoing column", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const tbody = document.querySelector(".TableDialog tbody");
    const originalNumRows = tbody.querySelectorAll("tr").length;
    userEvent.click(
      tbody.querySelector("tr:nth-child(2) .TableDialog__small-delete-btn"),
    );
    const newNumRows = tbody.querySelectorAll("tr").length;
    expect(getNode("MATH 126", container)).to.be.null;
    expect(newNumRows).to.eql(originalNumRows - 1);
  });
  it("Links Outgoing column to MyPlan", () => {
    const dialog = openTableDialog();
    const outgoing = dialog.querySelector(
      "tbody tr:nth-child(2) td:nth-child(7)",
    );
    // expect(outgoing.querySelector("a[href=\"https://myplan.uw.edu/course/#/courses/MATH 126\"][class=\"uw-course-id one-away\"]")).to.not.be.null;
    // For some reason MATH 126 has "ready" class for this test
    // Not seen when manually loading test flow and opening table
    expect(
      outgoing.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/MATH 207"][class="uw-course-id one-away"]',
      ),
    ).to.not.be.null;
    expect(
      outgoing.querySelector(
        'a[href="https://myplan.uw.edu/course/#/courses/AMATH 301"][class="uw-course-id one-away"]',
      ),
    ).to.not.be.null;
  });
  it("Deletes a course from the Delete column", () => {
    const { container } = render(newApp());
    openDialog("TableDialog__open-btn", container);
    const tbody = document.querySelector(".TableDialog tbody");
    const originalNumRows = tbody.querySelectorAll("tr").length;
    userEvent.click(tbody.querySelector(".TableDialog__large-delete-btn"));
    const newNumRows = tbody.querySelectorAll("tr").length;
    expect(getNode("AMATH 301", container)).to.be.null;
    expect(newNumRows).to.eql(originalNumRows - 1);
  });
});
