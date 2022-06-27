import { useState } from "react";
import { nanoid } from "nanoid";

import "./AmbiguitySelect.scss";

import type { SetState } from "types/main";

export type AmbiguityHandling = "aggressively" | "cautiously";

interface AmbiGuitySelectProps {
  ambiguityHandling: AmbiguityHandling;
  setAmbiguityHandling: SetState<AmbiguityHandling>;
  busy: boolean;
}
export default function AmbiguitySelect({
  ambiguityHandling,
  setAmbiguityHandling,
  busy,
}: AmbiGuitySelectProps): JSX.Element {
  const [fieldName, _setFieldName] = useState(() => nanoid());
  // Need a unique name for every new instance

  return (
    <fieldset className="AmbiguitySelect" disabled={busy}>
      <legend>When prereq text parsing fails, make connections</legend>
      <label>
        <input
          type="radio"
          name={fieldName}
          checked={ambiguityHandling === "aggressively"}
          onChange={() => setAmbiguityHandling("aggressively")}
        />
        Aggressively (all possible connections)
      </label>
      <label>
        <input
          type="radio"
          name={fieldName}
          checked={ambiguityHandling === "cautiously"}
          onChange={() => setAmbiguityHandling("cautiously")}
        />
        Cautiously (no new connections)
      </label>
    </fieldset>
  );
}
