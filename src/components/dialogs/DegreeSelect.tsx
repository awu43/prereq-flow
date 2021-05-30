import React, { useState, useRef } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { nanoid } from "nanoid";

import AmbiguitySelect from "./AmbiguitySelect";
import type { SetState, AmbiguityHandling } from "../../../types/main";

import "./DegreeSelect.scss";

function toKebabCase(text: string) {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

const dummyMajors = [
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
  <li className="majors__selected-item" key={nanoid()}>&nbsp;</li>,
];

interface DegreeSelectProps {
  connectionError: boolean;
  busy: boolean;
  setBusy: SetState<boolean>;
  supportedMajors: string[];
  newDegreeFlow: (majors: string[], ambHandle: AmbiguityHandling) => void;
  errorMsg: string;
}
export default function DegreeSelect({
  connectionError,
  busy,
  setBusy,
  supportedMajors,
  newDegreeFlow,
  errorMsg,
}: DegreeSelectProps) {
  const [majors, setMajors] = useState<string[]>([]);
  // const [minors, setMinors] = useState([]);
  const majorSelectRef = useRef<HTMLSelectElement>(null);
  const [
    ambiguityHandling,
    setAmbiguityHandling
  ] = useState<AmbiguityHandling>("aggressively");

  function addMajor() {
    if (!supportedMajors.length) {
      return;
    }
    if (majorSelectRef.current) {
      const selectInput = majorSelectRef.current;
      const selectedMajor = selectInput.options[selectInput.selectedIndex].label;
      if (!majors.includes(selectedMajor) && majors.length < 3) {
        setMajors(majors.concat([selectedMajor]));
      }
    }
  }

  function deleteMajor(targetMajor: string) {
    setMajors(majors.filter(m => m !== targetMajor));
  }

  // function addMinor(params) {

  // }

  function generateFlow(event: MouseEvent) {
    event.preventDefault();
    setBusy(true);

    newDegreeFlow(majors, ambiguityHandling);
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
          visible={!!errorMsg}
        >
          <div className="majors__bar-and-button">
            <select
              ref={majorSelectRef}
              className="majors__select-input"
              disabled={Boolean(connectionError || busy)}
            >
              {supportedMajors.map(m => (
                <option key={toKebabCase(m)}>{m}</option>
              ))}
            </select>
            <button
              className="majors__add-button"
              type="button"
              onClick={addMajor}
              disabled={Boolean(connectionError || busy)}
            >
              <img src="dist/icons/plus.svg" alt="Add" />
            </button>
          </div>
        </Tippy>
      </section>
      <small>See degree courses, suggest changes, and contribute new degree data&nbsp;<a href="https://github.com/awu43/prereq-flow-degrees" target="_blank" rel="noreferrer">here</a>.</small>

      <AmbiguitySelect
        ambiguityHandling={ambiguityHandling}
        setAmbiguityHandling={setAmbiguityHandling}
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
          disabled={Boolean(connectionError || busy || !majors.length)}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
