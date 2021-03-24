import React, { useState } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";

import testData from "./data/test-data.js";
import degreeRequirements from "./data/mech-eng.js";

const mockFetchedData = Object.fromEntries(
  degreeRequirements.flat().map(c => [c, testData[c]])
);

const mockMajorList = [
  "Mechanical Engineering",
  "Electrical Engineering (Controls)",
];

function toKebabCase(text) {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

export default function DegreeSelect({ busy, setBusy, advance }) {
  const [majors, setMajors] = useState([]);
  // const [minors, setMinors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(mockMajorList[0]);

  function onMajorSelect(event) {
    const { target } = event;
    setSelectedMajor(target.options[target.selectedIndex].label);
  }

  function addMajor() {
    if (!majors.includes(selectedMajor) && majors.length < 3) {
      setMajors(majors.concat([selectedMajor]));
    }
  }

  function deleteMajor(targetMajor) {
    setMajors(majors.filter(m => m !== targetMajor));
  }

  // function addMinor(params) {

  // }

  function getCourses(event) {
    event.preventDefault();
    // setBusy(true);
    // TODO: Fetch operation here
    // setTimeout(() => {
    //   advance([]);
    // }, 2000);
    advance(mockFetchedData);
  }

  const majorsListElems = majors.map(m => {
    const id = toKebabCase(m);
    return (
      <li className="selected-major" key={id}>
        {m}
        <button
          className="delete-major"
          type="button"
          onClick={() => deleteMajor(m)}
        >
          X
        </button>
      </li>
    );
  });
  const numEmpty = 3 - majorsListElems.length;
  for (let i = 0; i < numEmpty; i++) {
    majorsListElems.push(
      <li className="selected-major" key={nanoid()}>&nbsp;</li>
    );
  }

  return (
    <div className="DegreeSelect">
      <section className="majors">
        <h3>Majors (up to 3)</h3>
        <ul className="selected-majors">
          {majorsListElems}
        </ul>
        <div className="select-major">
          <select className="major-select" onChange={onMajorSelect}>
            {mockMajorList.map(m => <option key={toKebabCase(m)}>{m}</option>)}
          </select>
          <button className="add-major" type="button" onClick={addMajor}>+</button>
        </div>
      </section>
      <section className="minors">
        {/* <h3>Minors (up to 3)</h3> */}
        {/* <ul className="selected-minors">
          {minorsListElems}
        </ul>
        <div className="select-minor">
          <select className="minor-select" onChange={onMinorSelect}>
            {minorsList.map(m => <option key={toKebabCase(m)}>{m}</option>)}
          </select>
          <button className="add-minor" type="button" onClick={addMinor}>+</button>
        </div> */}
      </section>
      <button type="submit" onClick={getCourses} disabled={busy}>
        Get courses
      </button>
    </div>
  );
}
DegreeSelect.propTypes = {
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  advance: PropTypes.func.isRequired,
};
