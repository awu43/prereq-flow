// import { useState } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { SetState } from "types/main";

import "./NewFlowTextSearch.scss";
// import { courseIdMatch } from "@utils";
import AmbiguitySelect from "../AmbiguitySelect";
// import type { AmbiguityHandling } from "../AmbiguitySelect";

import type { TextSearchState } from "./types";

interface TextSearchProps {
  connectionError: boolean;
  busy: boolean;
  // setBusy: SetState<boolean>;
  tsState: TextSearchState;
  setTsState: SetState<TextSearchState>;
  newTextSearchFlow: () => Promise<void>;
  // errorMsg: string;
}
export default function NewFlowTextSearch({
  connectionError,
  busy,
  // setBusy,
  tsState,
  setTsState,
  newTextSearchFlow,
}: // errorMsg,
TextSearchProps): JSX.Element {
  // const [text, setText] = useState("");
  // const [ambiguityHandling, setAmbiguityHandling] =
  //   useState<AmbiguityHandling>("aggressively");

  function generateFlow(event: MouseEvent): void {
    event.preventDefault();
    newTextSearchFlow();
  }

  return (
    <div className="NewFlowTextSearch">
      <Tippy
        className="tippy-box--error"
        content={tsState.errorMsg}
        placement="bottom-start"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={!!tsState.errorMsg}
      >
        <textarea
          className="NewFlowTextSearch__textarea"
          placeholder="Text to search for UW course IDs"
          value={tsState.text}
          onChange={e =>
            setTsState(prev => ({ ...prev, text: e.target.value }))
          }
          disabled={connectionError || busy}
        ></textarea>
      </Tippy>

      <AmbiguitySelect
        ambiguityHandling={tsState.ambiguityHandling}
        setAmbiguityHandling={a => {
          setTsState(prev => ({ ...prev, ambiguityHandling: a }));
        }}
        busy={busy}
      />

      <div className="NewFlowTextSearch__button-wrapper">
        <button
          type="submit"
          className="NewFlowTextSearch__get-courses-button"
          onClick={generateFlow}
          disabled={connectionError || busy || !tsState.text.trim()}
        >
          Get courses
        </button>
      </div>
    </div>
  );
}
