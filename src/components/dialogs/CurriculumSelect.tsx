import React, { useState, useRef } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import CampusSelect from "./CampusSelect";
import AmbiguitySelect from "./AmbiguitySelect";
import type {
  SetState,
  AmbiguityHandling,
  Campus,
} from "../../../types/main";

import "./CurriculumSelect.scss";

interface CurriculumSelectProps {
  connectionError: boolean;
  busy: boolean;
  setBusy: SetState<boolean>;
  supportedCurricula: Map<Campus, HTMLOptionElement[]>;
  newCurriculumFlow: (
    curriculum: string,
    includeExternal: boolean,
    ambiguityHandling: AmbiguityHandling,
  ) => void;
  errorMsg: string;
}
export default function CurriculumSelect({
  connectionError,
  busy,
  setBusy,
  supportedCurricula,
  newCurriculumFlow,
  errorMsg,
}: CurriculumSelectProps) {
  const [selectedCampus, setSelectedCampus] = useState<Campus>("Seattle");
  const curriculumSelectRef = useRef<HTMLSelectElement>(null);

  const [includeExternal, setIncludeExternal] = useState(false);
  const [
    ambiguityHandling,
    setAmbiguityHandling
  ] = useState<AmbiguityHandling>("aggressively");

  function getCourses(event: MouseEvent) {
    event.preventDefault();
    setBusy(true);

    if (curriculumSelectRef.current) {
      const selectInput = curriculumSelectRef.current;
      const selectedCurriculum = (
        selectInput.options[selectInput.selectedIndex].value
      );
      newCurriculumFlow(selectedCurriculum, includeExternal, ambiguityHandling);
    }
  }

  return (
    <div className="CurriculumSelect">
      <CampusSelect
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        busy={busy}
      />
      <Tippy
        className="tippy-box--error"
        content={errorMsg}
        placement="bottom-start"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={!!errorMsg}
      >
        <select
          className="CurriculumSelect__select-input"
          ref={curriculumSelectRef}
          disabled={connectionError || busy}
        >
          {supportedCurricula.get(selectedCampus)}
        </select>
      </Tippy>
      <label className="CurriculumSelect__external-checkbox">
        <input
          type="checkbox"
          checked={includeExternal}
          onChange={() => setIncludeExternal(!includeExternal)}
          disabled={busy}
        />
        Include external prerequisites
      </label>
      <AmbiguitySelect
        ambiguityHandling={ambiguityHandling}
        setAmbiguityHandling={setAmbiguityHandling}
        busy={busy}
      />
      <div className="CurriculumSelect__button-wrapper">
        <button
          type="submit"
          className="CurriculumSelect__get-courses-button"
          onClick={getCourses}
          disabled={connectionError || busy}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
