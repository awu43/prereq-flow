import { useEffect } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { SetState, Campus } from "types/main";

import CampusSelect from "../CampusSelect";
import AmbiguitySelect from "../AmbiguitySelect";

import "./CurriculumSelect.scss";
import type { CurriculumSelectState } from "./types";

interface CurriculumSelectProps {
  tabIndex: number;
  connectionError: boolean;
  busy: boolean;
  supportedCurricula: Record<Campus, [string, string][]>;
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
  useEffect(() => {
    if (
      supportedCurricula.Seattle.length &&
      !Object.values(csState.selected).some(s => s)
    ) {
      setCsState(prev => ({
        ...prev,
        selected: {
          Seattle: supportedCurricula.Seattle[0][0],
          Bothell: supportedCurricula.Bothell[0][0],
          Tacoma: supportedCurricula.Tacoma[0][0],
        },
      }));
    }
  }, [supportedCurricula]);

  function getCourses(event: MouseEvent): void {
    event.preventDefault();
    newCurriculumFlow();
  }

  return (
    <div className="CurriculumSelect">
      <CampusSelect
        selectedCampus={csState.campus}
        setSelectedCampus={c => setCsState(prev => ({ ...prev, campus: c }))}
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
          value={csState.selected[csState.campus]}
          onChange={e => {
            setCsState(prev => ({
              ...prev,
              selected: {
                ...prev.selected,
                [prev.campus]: e.target.selectedOptions[0].value,
              },
            }));
          }}
          disabled={
            connectionError || busy || !supportedCurricula.Seattle.length
          }
        >
          {supportedCurricula[csState.campus].map(([id, name]) => (
            <option key={id} value={id}>
              {`${id}: ${name}`}
            </option>
          ))}
        </select>
      </Tippy>
      <label className="CurriculumSelect__external-checkbox">
        <input
          type="checkbox"
          checked={csState.includeExternal}
          onChange={() => {
            setCsState(prev => ({
              ...prev,
              includeExternal: !prev.includeExternal,
            }));
          }}
          disabled={busy}
        />
        Include external prerequisites
      </label>
      <AmbiguitySelect
        ambiguityHandling={csState.ambiguityHandling}
        setAmbiguityHandling={a => {
          setCsState(prev => ({ ...prev, ambiguityHandling: a }));
        }}
        busy={busy}
      />
      <div className="CurriculumSelect__button-wrapper">
        <button
          type="submit"
          className="CurriculumSelect__get-courses-button"
          onClick={getCourses}
          disabled={
            connectionError || busy || !supportedCurricula.Seattle.length
          }
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
