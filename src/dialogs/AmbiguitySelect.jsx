import React, { useState } from "react";
import PropTypes from "prop-types";
import { nanoid } from "nanoid";

export default function AmbiguitySelect({
  ambiguousHandling, setAmbiguousHandling, busy
}) {
  const [fieldName, _setFieldName] = useState(() => nanoid());
  // Need a unique name for every new instance

  return (
    <fieldset className="AmbiguitySelect" disabled={busy}>
      <legend>Ambiguous prereqs (e.g. <q>Either X or Y</q>) should be handled</legend>
      <label>
        <input
          type="radio"
          name={fieldName}
          checked={ambiguousHandling === "aggressively"}
          onChange={() => setAmbiguousHandling("aggressively")}
        />
        Aggressively (two new connections)
      </label>
      <label>
        <input
          type="radio"
          name={fieldName}
          checked={ambiguousHandling === "cautiously"}
          onChange={() => setAmbiguousHandling("cautiously")}
        />
        Cautiously (no new connections)
      </label>
    </fieldset>
  );
}
AmbiguitySelect.propTypes = {
  ambiguousHandling: PropTypes.string.isRequired,
  setAmbiguousHandling: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};
