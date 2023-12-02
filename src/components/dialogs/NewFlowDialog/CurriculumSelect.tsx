import { useEffect } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { SetState } from "types/main";
import { stateUpdater } from "@utils";

import CampusSelect from "../CampusSelect";
import AmbiguitySelect from "../AmbiguitySelect";

import "./CurriculumSelect.scss";
import type { CurriculumSelectState } from "./types";

interface CurriculumSelectProps {
  tabIndex: number;
  connectionError: boolean;
  busy: boolean;
  supportedCurricula: [string, string][];
  csState: CurriculumSelectState;
  setCsState: SetState<CurriculumSelectState>;
  newCurriculumFlow: () => void;
}
export default function CurriculumSelect({
  tabIndex,
  connectionError,
  busy,
  supportedCurricula,
  csState,
  setCsState,
  newCurriculumFlow,
}: CurriculumSelectProps): JSX.Element {
  const csUpdater = stateUpdater(setCsState);

  useEffect(() => {
    if (supportedCurricula.length && !csState.selected) {
      csUpdater.value("selected", supportedCurricula[0][0]);
    }
  }, [supportedCurricula]);

  function getCourses(event: MouseEvent): void {
    event.preventDefault();
    newCurriculumFlow();
  }

  return (
    <div className="CurriculumSelect">
      <CampusSelect
        selectedCampus="Seattle"
        setSelectedCampus={_ => {}}
        busy={busy}
      />
      <Tippy
        className="tippy-box--error"
        content={csState.errorMsg}
        placement="bottom-start"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={tabIndex === 1 && !!csState.errorMsg}
      >
        <select
          className="CurriculumSelect__select-input"
          value={csState.selected}
          onChange={e => {
            csUpdater.value("selected", e.target.selectedOptions[0].value);
          }}
          disabled={connectionError || busy || !supportedCurricula.length}
        >
          {supportedCurricula.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </Tippy>
      <label className="CurriculumSelect__external-checkbox">
        <input
          type="checkbox"
          checked={csState.includeExternal}
          onChange={() => {
            csUpdater.transform(
              "includeExternal",
              prev => !prev.includeExternal,
            );
          }}
          disabled={busy}
        />
        Include external prerequisites
      </label>
      <AmbiguitySelect
        ambiguityHandling={csState.ambiguityHandling}
        setAmbiguityHandling={a => csUpdater.value("ambiguityHandling", a)}
        busy={busy}
      />
      <div className="CurriculumSelect__button-wrapper">
        <button
          type="submit"
          className="CurriculumSelect__get-courses-button"
          onClick={getCourses}
          disabled={connectionError || busy || !supportedCurricula.length}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
