import { useEffect } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { nanoid } from "nanoid";

import timesIcon from "@icons/times.svg";
import plusIcon from "@icons/plus.svg";

import type { SetState } from "types/main";

import { stateUpdater } from "@utils";
import AmbiguitySelect from "../AmbiguitySelect";

import "./DegreeSelect.scss";
import type { DegreeSelectState } from "./types";

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
  tabIndex: number;
  connectionError: boolean;
  busy: boolean;
  supportedMajors: [string, string[]][];
  dsState: DegreeSelectState;
  setDsState: SetState<DegreeSelectState>;
  newDegreeFlow: () => void;
}
export default function DegreeSelect({
  tabIndex,
  connectionError,
  busy,
  supportedMajors,
  dsState,
  setDsState,
  newDegreeFlow,
}: DegreeSelectProps): JSX.Element {
  const dsUpdater = stateUpdater(setDsState);

  useEffect(() => {
    if (supportedMajors.length && !dsState.selected) {
      dsUpdater.value("selected", supportedMajors[0][0]);
    }
  }, [supportedMajors]);

  function addMajor(): void {
    if (!supportedMajors.length) {
      return;
    }
    if (
      !dsState.majors.includes(dsState.selected) &&
      dsState.majors.length < 3
    ) {
      dsUpdater.transform("majors", prev =>
        prev.majors.concat([prev.selected]),
      );
    }
  }

  function deleteMajor(targetMajor: string): void {
    dsUpdater.transform("majors", prev =>
      prev.majors.filter(m => m !== targetMajor),
    );
  }

  // function addMinor(params) {

  // }

  function generateFlow(event: MouseEvent): void {
    event.preventDefault();
    newDegreeFlow();
  }

  const majorsListElems = dsState.majors.map(m => {
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
          content={dsState.errorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={tabIndex === 0 && !!dsState.errorMsg}
        >
          <div className="majors__bar-and-button">
            <select
              className="majors__select-input"
              value={dsState.selected}
              onChange={e =>
                dsUpdater.value(
                  "selected",
                  e.target.selectedOptions[0].textContent as string,
                )
              }
              disabled={connectionError || busy || !supportedMajors.length}
            >
              {supportedMajors.map(m => (
                <option key={toKebabCase(m[0])}>{m[0]}</option>
              ))}
            </select>
            <button
              className="majors__add-button"
              type="button"
              onClick={addMajor}
              disabled={
                connectionError ||
                busy ||
                !supportedMajors.length ||
                dsState.majors.includes(dsState.selected) ||
                dsState.majors.length >= 3
              }
            >
              <img src={plusIcon} alt="Add" />
            </button>
          </div>
        </Tippy>
      </section>

      <AmbiguitySelect
        ambiguityHandling={dsState.ambiguityHandling}
        setAmbiguityHandling={a => dsUpdater.value("ambiguityHandling", a)}
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
          disabled={connectionError || busy || !dsState.majors.length}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
