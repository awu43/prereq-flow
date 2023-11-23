import "./CampusSelect.scss";

import type { Campus } from "types/main";

interface CampusSelectProps {
  selectedCampus: Campus;
  setSelectedCampus: (c: Campus) => void;
  busy: boolean;
}
export default function CampusSelect({
  selectedCampus,
  setSelectedCampus,
  busy,
}: CampusSelectProps): JSX.Element {
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
          disabled={true}
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
          disabled={true}
        />
        Tacoma
      </label>
    </fieldset>
  );
}
