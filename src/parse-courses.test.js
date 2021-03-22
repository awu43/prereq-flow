/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { expect } from "chai";

import { _testing } from "./data/parse-courses.js";

const {
  EITHER_OR_REGEX,
  COURSE_REGEX,
  DOUBLE_EITHER_REGEX,
  TRIPLE_EITHER_REGEX,
  CONCURRENT_REGEX,
} = _testing;

describe("EITHER_OR_REGEX", () => {
  it("Tests false for 'Either a minimum grade of 1.7 in CHEM 110, a passing score in the General Chemistry Placement exam, or a score of 1 or higher on Chemistry AP test.'", () => {
    const test = EITHER_OR_REGEX.test(
      "Either a minimum grade of 1.7 in CHEM 110, a passing score in the General Chemistry Placement exam, or a score of 1 or higher on Chemistry AP test."
    );
    expect(test).to.be.true;
  });
});

describe("COURSE_REGEX", () => {
  it("Matches 'MATH 125'", () => {
    expect("MATH 125".match(COURSE_REGEX)).to.eql(["MATH 125"]);
  });
  it("Matches 'A A 210'", () => {
    expect("A A 210".match(COURSE_REGEX)).to.eql(["A A 210"]);
  });
  it("Tests false for 'None'", () => {
    expect(COURSE_REGEX.test("None")).to.be.false;
  });
});

describe("DOUBLE_EITHER_REGEX", () => {
  it("Matches 'Either MATH 125 or MATH 134'", () => {
    const match = (
      "Either MATH 125 or MATH 134".match(DOUBLE_EITHER_REGEX).slice(1, 3)
    );
    expect(match).to.eql(["MATH 125", "MATH 134"]);
  });
  it("Matches 'MATH 126 or MATH 136.'", () => {
    const match = (
      "MATH 126 or MATH 136.".match(DOUBLE_EITHER_REGEX).slice(1, 3)
    );
    expect(match).to.eql(["MATH 126", "MATH 136"]);
  });
});

describe("TRIPLE_EITHER_REGEX", () => {
  it("Matches 'Either MATH 125, Q SCI 292, or MATH 135'", () => {
    const match = (
      "Either Either MATH 125, Q SCI 292, or MATH 135"
        .match(TRIPLE_EITHER_REGEX)
        .slice(1, 4)
    );
    expect(match).to.eql(["MATH 125", "Q SCI 292", "MATH 135"]);
  });
});

describe("CONCURRENT_REGEX", () => {
  it("Tests true for 'Either MATH 124 or MATH 134, which may be taken concurrently.'", () => {
    const test = CONCURRENT_REGEX.test(
      "Either MATH 124 or MATH 134, which may be taken concurrently."
    );
    expect(test).to.be.true;
  });
  it("Tests true for 'Either MATH 125 or MATH 135, which may be taken concurrently'", () => {
    const test = CONCURRENT_REGEX.test(
      "Either MATH 124 or MATH 134, which may be taken concurrently."
    );
    expect(test).to.be.true;
  });
  it("Tests true for 'IND E 315 or MATH 390 either of which may be taken concurrently. Instructors: Cooper'", () => {
    const test = CONCURRENT_REGEX.test(
      "IND E 315 or MATH 390 either of which may be taken concurrently. Instructors: Cooper"
    );
    expect(test).to.be.true;
  });
});
