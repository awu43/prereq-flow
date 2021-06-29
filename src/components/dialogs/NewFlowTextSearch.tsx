import React, { useState } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import "./NewFlowTextSearch.scss";
import type { SetState, AmbiguityHandling } from "types/main";

import { courseIdMatch } from "@utils";
import AmbiguitySelect from "./AmbiguitySelect";

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
export default function NewFlowTextSearch({
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
    <div className="NewFlowTextSearch">
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
          className="NewFlowTextSearch__textarea"
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

      <div className="NewFlowTextSearch__button-wrapper">
        <button
          type="submit"
          className="NewFlowTextSearch__get-courses-button"
          onClick={generateFlow}
          disabled={Boolean(connectionError || busy || !text.trim())}
        >
          Get courses
        </button>
      </div>
    </div>
  );
}
