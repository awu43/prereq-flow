import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

function toKebabCase(text) {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

const dummyMajors = [
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
];

export default function DegreeSelect({
  supportedMajors, busy, setBusy, advance
}) {
  const [majors, setMajors] = useState([]);
  // const [minors, setMinors] = useState([]);

  const majorSelectRef = useRef(null);

  function addMajor() {
    if (!supportedMajors.length) {
      return;
    }
    const selectInput = majorSelectRef.current;
    const selectedMajor = selectInput.options[selectInput.selectedIndex].label;
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
      <li className="majors__selected-item" key={id}>
        {m}
        <button
          className="majors__delete-button"
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
    <form className="DegreeSelect">
      <section className="majors">
        <h3>Majors (up to 3)</h3>
        <ul className="majors__selected-list">
          {majorsListElems}
        </ul>
        <div className="majors__bar-and-button">
          <select className="majors__select-input" ref={majorSelectRef}>
            {supportedMajors.map(m => <option key={toKebabCase(m)}>{m}</option>)}
          </select>
          <button
            className="majors__add-button"
            type="button"
            onClick={addMajor}
          >
            <img src="dist/icons/plus.svg" alt="Add" />
          </button>
        </div>
      </section>
      <p>Only College of Engineering majors are currently available. See <a href="https://github.com/awu43/prereq-flow#readme" target="_blank" rel="noreferrer">README</a> for&nbsp;details.</p>
      {/* TODO: Minors */}
      <section className="minors">
        {/* <h3>Minors (up to 3)</h3> */}
        {/* <ul className="minors__selected-list">
          {minorsListElems}
        </ul>
        <div className="minors__bar-and-button">
          <select className="minors__select-input" onChange={onMinorSelect}>
            {minorsList.map(m => <option key={toKebabCase(m)}>{m}</option>)}
          </select>
          <button className="minors__add-button" type="button" onClick={addMinor}>+</button>
        </div> */}
      </section>
      <button
        className="DegreeSelect__get-courses-button"
        type="submit"
        onClick={getCourses}
        disabled={busy || !majors.length}
      >
        Get courses
      </button>
    </form>
  );
}
DegreeSelect.propTypes = {
  supportedMajors: PropTypes.arrayOf(PropTypes.string).isRequired,
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  advance: PropTypes.func.isRequired,
};
