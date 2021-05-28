import React from "react";
import PropTypes from "prop-types";

import "./CampusSelect.scss";

export default function CampusSelect({
  selectedCampus, setSelectedCampus, busy
}) {
  return (
    <fieldset className="CampusSelect" disabled={busy}>
      <label className="CampusSelect__radio-label--seattle">
        <input
          type="radio"
          className="CampusSelect__radio-button"
          name="uw-campus"
          checked={selectedCampus === "Seattle"}
          onChange={() => setSelectedCampus("Seattle")}
        />
        Seattle
      </label>
      <label className="CampusSelect__radio-label--bothell">
        <input
          type="radio"
          className="CampusSelect__radio-button"
          name="uw-campus"
          checked={selectedCampus === "Bothell"}
          onChange={() => setSelectedCampus("Bothell")}
        />
        Bothell
      </label>
      <label className="CampusSelect__radio-label--tacoma">
        <input
          type="radio"
          className="CampusSelect__radio-button"
          name="uw-campus"
          checked={selectedCampus === "Tacoma"}
          onChange={() => setSelectedCampus("Tacoma")}
        />
        Tacoma
      </label>
    </fieldset>
  );
}
CampusSelect.propTypes = {
  selectedCampus: PropTypes.string.isRequired,
  setSelectedCampus: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};
