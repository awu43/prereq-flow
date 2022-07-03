import { useState, useEffect } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { nanoid } from "nanoid";

import timesIcon from "@icons/times.svg";
import plusIcon from "@icons/plus.svg";

import type { SetState } from "types/main";
import type { AmbiguityHandling } from "../AmbiguitySelect";

import AmbiguitySelect from "../AmbiguitySelect";

import "./DegreeSelect.scss";

function toKebabCase(text: string): string {
  return text.replace(/[().]/g, "").replace(/ /g, "-").toLowerCase();
}

const dummyMajors = [
  <li className="majors__selected-item" key={nanoid()}>
    &nbsp;
  </li>,
  <li className="majors__selected-item" key={nanoid()}>
    &nbsp;
  </li>,
  <li className="majors__selected-item" key={nanoid()}>
    &nbsp;
  </li>,
];

interface DegreeSelectProps {
  connectionError: boolean;
  busy: boolean;
  setBusy: SetState<boolean>;
  supportedMajors: string[];
  newDegreeFlow: (
    majors: string[],
    ambiguityHandling: AmbiguityHandling,
  ) => void;
  errorMsg: string;
}
export default function DegreeSelect({
  connectionError,
  busy,
  setBusy,
  supportedMajors,
  newDegreeFlow,
  errorMsg,
}: DegreeSelectProps): JSX.Element {
  const [majors, setMajors] = useState<string[]>([]);
  // const [minors, setMinors] = useState([]);
  const [currentlySelected, setCurrentlySelected] = useState("");
  const [ambiguityHandling, setAmbiguityHandling] =
    useState<AmbiguityHandling>("aggressively");

  useEffect(() => {
    if (supportedMajors.length) {
      setCurrentlySelected(supportedMajors[0]);
    }
  }, [supportedMajors]);

  function addMajor(): void {
    if (!supportedMajors.length) {
      return;
    }
    if (!majors.includes(currentlySelected) && majors.length < 3) {
      setMajors(majors.concat([currentlySelected]));
    }
  }

  function deleteMajor(targetMajor: string): void {
    setMajors(majors.filter(m => m !== targetMajor));
  }

  // function addMinor(params) {

  // }

  function generateFlow(event: MouseEvent): void {
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
          <img src={timesIcon} alt="Remove" />
        </button>
      </li>
    );
  });
  majorsListElems.push(...dummyMajors.slice(majorsListElems.length));

  return (
    <div className="DegreeSelect">
      <section className="majors">
        <h3>Majors</h3>
        <ul className="majors__selected-list">{majorsListElems}</ul>
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
              className="majors__select-input"
              onChange={e => {
                setCurrentlySelected(
                  e.target.selectedOptions[0].textContent as string,
                );
              }}
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
              disabled={Boolean(
                connectionError ||
                  busy ||
                  majors.includes(currentlySelected) ||
                  majors.length >= 3,
              )}
            >
              <img src={plusIcon} alt="Add" />
            </button>
          </div>
        </Tippy>
      </section>
      <small>
        See available degrees and course lists on&nbsp;
        <a
          href="https://github.com/awu43/prereq-flow-degrees"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </small>
      <small>
        Send suggestions for changes to{" "}
        <a href="mailto:comments@prereqflow.com">comments@prereqflow.com</a>
      </small>

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
