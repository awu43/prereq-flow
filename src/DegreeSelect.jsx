import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

function toKebabCase(text) {
  return text.replace(/ /g, "-").toLowerCase();
}

// FIXME: Initialize selectedMajor
export default function DegreeSelect({ busy, setBusy, advance }) {
  const [majors, setMajors] = useState([]);
  // const [minors, setMinors] = useState([]);
  const selectedMajor = useRef("");

  function onMajorSelect(event) {
    const { target } = event;
    selectedMajor.current = target.options[target.selectedIndex].label;
  }

  function addMajor() {
    if (!majors.includes(selectedMajor.current)) {
      setMajors(majors.concat([selectedMajor.current]));
    }
    // TODO: Limit to 3 majors
  }

  function deleteMajor(targetMajor) {
    setMajors(majors.filter(m => m !== targetMajor));
  }

  // function addMinor(params) {

  // }

  function getCourses(event) {
    event.preventDefault();
    setBusy(true);
    // TODO: Fetch operation here
    setTimeout(() => {
      advance();
      setBusy(false);
    }, 2000);
  }

  const majorsList = majors.map(m => {
    const id = toKebabCase(m);
    return (
      <li key={id} id={id}>
        <label>
          {m}
          <button type="button" onClick={() => deleteMajor(m)}>
            X
          </button>
        </label>
      </li>
    );
  });

  return (
    <div className="DegreeSelect">
      <section className="majors">
        <h3>Majors</h3>
        <ul>
          {majorsList}
        </ul>
        {/* <input type="text" /> */}
        <select onChange={onMajorSelect}>
          <option>Mechanical Engineering (Mechatronics)</option>
          <option>Electrical Engineering</option>
          <option>Computer Science &amp; Engineering</option>
        </select>
        <button type="button" onClick={addMajor}>+</button>
      </section>
      <section className="minors">
        <h3>Minors</h3>
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
