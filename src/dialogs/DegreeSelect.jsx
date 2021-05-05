import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { nanoid } from "nanoid";

import AmbiguitySelect from "./AmbiguitySelect.jsx";

function toKebabCase(text) {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

const dummyMajors = [
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
];

export default function DegreeSelect({
  busy, setBusy, supportedMajors, newDegreeFlow, errorMsg
}) {
  const [majors, setMajors] = useState([]);
  // const [minors, setMinors] = useState([]);
  const majorSelectRef = useRef(null);
  const [ambiguousHandling, setAmbiguousHandling] = useState("aggressively");

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

  function generateFlow(event) {
    event.preventDefault();
    setBusy(true);

    newDegreeFlow(majors, ambiguousHandling);
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
          disabled={busy}
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
        <ul className="majors__selected-list">
          {majorsListElems}
        </ul>
        <Tippy
          className="tippy-box--error"
          content={errorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={errorMsg.length}
        >
          <div className="majors__bar-and-button">
            <select
              ref={majorSelectRef}
              className="majors__select-input"
              disabled={busy}
            >
              {supportedMajors.map(m => (
                <option key={toKebabCase(m)}>{m}</option>
              ))}
            </select>
            <button
              className="majors__add-button"
              type="button"
              onClick={addMajor}
              disabled={busy}
            >
              <img src="dist/icons/plus.svg" alt="Add" />
            </button>
          </div>
        </Tippy>
      </section>
      <small>See degree courses, suggest changes, and contribute new degree data&nbsp;<a href="https://github.com/awu43/prereq-flow-degrees" target="_blank" rel="noreferrer">here</a>.</small>

      <AmbiguitySelect
        ambiguousHandling={ambiguousHandling}
        setAmbiguousHandling={setAmbiguousHandling}
        busy={busy}
      />

      {/* TODO: Minors */}
      {/* <section className="minors">
        <h3>Minors (up to 3)</h3>
        <ul className="minors__selected-list">
          {minorsListElems}
        </ul>
        <div className="minors__bar-and-button">
          <select className="minors__select-input" onChange={onMinorSelect}>
            {minorsList.map(m => <option key={toKebabCase(m)}>{m}</option>)}
          </select>
          <button className="minors__add-button" type="button" onClick={addMinor}>+</button>
        </div>
      </section> */}
      <div className="DegreeSelect__button-wrapper">
        <button
          className="DegreeSelect__get-courses-button"
          type="submit"
          onClick={generateFlow}
          disabled={busy || !majors.length}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
DegreeSelect.propTypes = {
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  supportedMajors: PropTypes.arrayOf(PropTypes.string).isRequired,
  newDegreeFlow: PropTypes.func.isRequired,
  errorMsg: PropTypes.string.isRequired,
};
