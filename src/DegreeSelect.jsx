import React, { useState } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

const mockMajorList = [
  "Civil Engineering",
  "Electrical Engineering (Controls)",
  "Materials Science & Engineering",
  "Mechanical Engineering",
];

function toKebabCase(text) {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

const dummyMajors = [
  <li className="selected-major dummy" key={nanoid()}>&nbsp;</li>,
  <li className="selected-major dummy" key={nanoid()}>&nbsp;</li>,
  <li className="selected-major dummy" key={nanoid()}>&nbsp;</li>,
];

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
    setBusy(true);
    fetch(`${API_URL}/degrees/`, {
      method: "POST",
      headers: { contentType: "application/json" },
      body: JSON.stringify(majors),
    })
      .then(resp => resp.json())
      .then(data => advance(data))
      .catch(error => {
        console.error("Error:", error);
      });
    // TODO: Proper error handling
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
          <img src="dist/icons/times.svg" alt="Delete" />
        </button>
      </li>
    );
  });
  majorsListElems.push(...dummyMajors.slice(majorsListElems.length));

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
          <button className="add-major" type="button" onClick={addMajor}>
            <img src="dist/icons/plus.svg" alt="Add" />
          </button>
        </div>
      </section>
      <p>Not all majors are available. See <a href="https://github.com/andrew-1135/prereq-flow#supported-majors" target="_blank" rel="noreferrer">README</a> for&nbsp;details.</p>
      {/* TODO: Minors */}
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
      <button
        type="submit"
        onClick={getCourses}
        disabled={busy || !majors.length}
      >
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
