import React, { useState } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import "./TextSearch.scss";
import type { SetState, AmbiguityHandling } from "types/main";

import AmbiguitySelect from "./AmbiguitySelect";
import { courseIdMatch } from "../../utils";

interface TextSearchProps {
  connectionError: boolean;
  busy: boolean;
  setBusy: SetState<boolean>;
  newTextSearchFlow: (
    courses: string[],
    ambiguityHandling: AmbiguityHandling
  ) => Promise<void>;
  errorMsg: string;
}
export default function TextSearch({
  connectionError,
  busy,
  setBusy,
  newTextSearchFlow,
  errorMsg,
}: TextSearchProps) {
  const [text, setText] = useState("");
  const [
    ambiguityHandling,
    setAmbiguityHandling
  ] = useState<AmbiguityHandling>("aggressively");

  function generateFlow(event: MouseEvent): void {
    event.preventDefault();
    setBusy(true);

    const courseMatches = courseIdMatch(text) ?? [];
    newTextSearchFlow([...new Set(courseMatches)], ambiguityHandling);
  }

  return (
    <div className="TextSearch">
      <Tippy
        className="tippy-box--error"
        content={errorMsg}
        placement="bottom-start"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={!!errorMsg}
      >
        <textarea
          className="TextSearch__textarea"
          placeholder="Text to search for UW course IDs"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={Boolean(connectionError || busy)}
        >
        </textarea>
      </Tippy>

      <AmbiguitySelect
        ambiguityHandling={ambiguityHandling}
        setAmbiguityHandling={setAmbiguityHandling}
        busy={busy}
      />

      <div className="TextSearch__button-wrapper">
        <button
          type="submit"
          className="TextSearch__get-courses-button"
          onClick={generateFlow}
          disabled={Boolean(connectionError || busy)}
        >
          Get courses
        </button>
      </div>
    </div>
  );
}
