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

import { courseIdMatch } from "../../utils";

interface TextSearchProps {
  tabIndex: number;
  connectionError: boolean;
  errorMsg: string;
  setErrorMsg: SetState<string>
  busy: boolean;
  addCoursesFromText: (
    matches: RegExpMatchArray,
    connectTo: ConnectTo,
  ) => Promise<boolean>;
}
export default function NewFlowTextSearch({
  tabIndex,
  connectionError,
  errorMsg,
  setErrorMsg,
  busy,
  addCoursesFromText,
}: TextSearchProps) {
  const [text, setText] = useState("");
  const [connectTo, setConnectTo] = useState<ConnectTo>({
    prereq: true,
    postreq: true,
  });

  async function AddCourses(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const success = await addCoursesFromText(
      [...new Set(courseIdMatch(text) || [])], connectTo
    );
    if (success) {
      setText("");
    }
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
        visible={tabIndex === 2 && !!errorMsg}
      >
        <textarea
          className="AddCourseTextSearch__textarea"
          placeholder="Text to search for UW course IDs"
          value={text}
          onChange={e => {
            setText(e.target.value);
            setErrorMsg("");
          }}
          disabled={connectionError || busy}
        >
        </textarea>
      </Tippy>

      <p>⚠️Added courses are placed below existing courses⚠️</p>
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
