/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { expect } from "chai";

import { _testing } from "./data/parse-courses.js";

const {
  COURSE_REGEX,
  DOUBLE_EITHER_REGEX,
  TRIPLE_EITHER_REGEX,
} = _testing;

describe("COURSE_REGEX", () => {
  it("Matches 'MATH 125'", () => {
    expect("MATH 125".match(COURSE_REGEX)).to.eql(["MATH 125"]);
  });
  it("Matches 'A A 210'", () => {
    expect("A A 210".match(COURSE_REGEX)).to.eql(["A A 210"]);
  });
  it("Does not match 'None'", () => {
    expect("None".match(COURSE_REGEX)).to.be.null;
  });
});

describe("DOUBLE_EITHER_REGEX", () => {
  it("Matches 'Either MATH 125 or MATH 134'", () => {
    const match = (
      "Either MATH 125 or MATH 134".match(DOUBLE_EITHER_REGEX).slice(1, 3)
    );
    expect(match).to.eql(["MATH 125", "MATH 134"]);
  });
});

describe("TRIPLE_EITHER_REGEX", () => {
  it("Matches 'Either MATH 125, Q SCI 292, or MATH 135'", () => {
    const match = (
      "Either Either MATH 125, Q SCI 292, or MATH 135".match(TRIPLE_EITHER_REGEX)
        .slice(1, 4)
    );
    expect(match).to.eql(["MATH 125", "Q SCI 292", "MATH 135"]);
  });
});
