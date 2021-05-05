import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import CampusSelect from "./CampusSelect.jsx";
import AmbiguitySelect from "./AmbiguitySelect.jsx";

export default function CurriculumSelect({
  busy, setBusy, supportedCurricula, newCurriculumFlow
}) {
  const [selectedCampus, setSelectedCampus] = useState("Seattle");
  const curriculumSelectRef = useRef(null);

  const [includeExternal, setIncludeExternal] = useState(false);
  const [ambiguousHandling, setAmbiguousHandling] = useState("aggressively");

  function getCourses(event) {
    event.preventDefault();
    setBusy(true);

    const selectInput = curriculumSelectRef.current;
    const selectedCurriculum = (
      selectInput.options[selectInput.selectedIndex].value
    );
    newCurriculumFlow(selectedCurriculum, includeExternal, ambiguousHandling);
  }

  return (
    <div className="CurriculumSelect">
      <CampusSelect
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        busy={busy}
      />
      <select
        className="CurriculumSelect__select-input"
        ref={curriculumSelectRef}
        disabled={busy}
      >
        {supportedCurricula.get(selectedCampus)}
      </select>
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
        ambiguousHandling={ambiguousHandling}
        setAmbiguousHandling={setAmbiguousHandling}
        busy={busy}
      />
      <div className="CurriculumSelect__button-wrapper">
        <button
          type="submit"
          className="CurriculumSelect__get-courses-button"
          onClick={getCourses}
          disabled={busy}
        >
          Get courses
        </button>
      </div>
      <div className="DegreeSelect__end-padding"></div>
    </div>
  );
}
CurriculumSelect.propTypes = {
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  supportedCurricula: PropTypes.instanceOf(Map).isRequired,
  newCurriculumFlow: PropTypes.func.isRequired,
};
