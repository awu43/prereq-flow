import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import CampusSelect from "./CampusSelect.jsx";
import AmbiguitySelect from "./AmbiguitySelect.jsx";

export default function CurriculumSelect({
  supportedCurricula, busy, setBusy, advance
}) {
  const [selectedCampus, setSelectedCampus] = useState("Seattle");
  const curriculumSelectRef = useRef(null);

  const [includeExternal, setIncludeExternal] = useState(true);
  const [ambiguousHandling, setAmbiguousHandling] = useState("aggressively");

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
          className="CurriculumSelect__get-courses-button"
          type="button"
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
  supportedCurricula: PropTypes.instanceOf(Map).isRequired,
  busy: PropTypes.bool.isRequired,
  setBusy: PropTypes.func.isRequired,
  advance: PropTypes.func.isRequired,
};
