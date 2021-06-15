import React, { useState } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  SetState,
  ConnectTo,
} from "types/main";

import "./AddCourseTextSearch.scss";

// import { courseIdMatch } from "../../utils";

interface TextSearchProps {
  connectionError: boolean;
  busy: boolean;
  setBusy: SetState<boolean>;
  // newTextSearchFlow: (
  //   courses: string[],
  //   ambiguityHandling: AmbiguityHandling
  // ) => Promise<void>;
}
export default function NewFlowTextSearch({
  connectionError,
  busy,
  setBusy,
  // newTextSearchFlow,
}: TextSearchProps) {
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [connectTo, setConnectTo] = useState<ConnectTo>({
    prereq: true,
    postreq: true,
  });
  const [alwaysAtZero, setAlwaysAtZero] = useState(false);

  function AddCourses(event: MouseEvent): void {
    event.preventDefault();
    setBusy(true);

    // const courseMatches = courseIdMatch(text) ?? [];
  }

  return (
    <form className="AddCourseTextSearch">
      <Tippy
        className="tippy-box--error"
        content={errorMsg}
        placement="bottom-end"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={!!errorMsg}
      >
        <textarea
          className="AddCourseTextSearch__textarea"
          placeholder="Text to search for UW course IDs"
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={connectionError || busy}
        >
        </textarea>
      </Tippy>

      <label>
        <input
          type="checkbox"
          checked={connectTo.prereq}
          disabled={busy}
          onChange={() => {
            setConnectTo(prev => ({ ...prev, prereq: !prev.prereq }));
          }}
        />
        Connect to existing prereqs
      </label>
      <label>
        <input
          type="checkbox"
          checked={connectTo.postreq}
          disabled={busy}
          onChange={() => {
            setConnectTo(prev => ({ ...prev, postreq: !prev.postreq }));
          }}
        />
        Connect to existing postreqs
      </label>
      <label>
        <input
          type="checkbox"
          checked={alwaysAtZero}
          disabled={busy}
          onChange={() => setAlwaysAtZero(!alwaysAtZero)}
        />
        Always place new courses at (0, 0)
      </label>

      <button
        type="submit"
        className="AddCourseTextSearch__add-courses-button"
        onClick={AddCourses}
        disabled={connectionError || busy}
      >
        Add courses
      </button>
    </form>
  );
}
