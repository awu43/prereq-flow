import { useRef, useEffect } from "react";
import type { MouseEvent } from "react";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { SetState } from "types/main";

import "./AddCourseTextSearch.scss";

import { stateUpdater } from "@utils";

import type { TextSearchState } from "./types";

interface TextSearchProps {
  tabIndex: number;
  tsState: TextSearchState;
  setTsState: SetState<TextSearchState>;
  busy: boolean;
  addCoursesFromText: (e: MouseEvent) => Promise<void>;
}
export default function NewFlowTextSearch({
  tabIndex,
  tsState,
  setTsState,
  busy,
  addCoursesFromText,
}: TextSearchProps): JSX.Element {
  const tsUpdater = stateUpdater(setTsState);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    textAreaRef.current?.setSelectionRange(
      tsState.text.length,
      tsState.text.length,
    );
    if (tabIndex === 2) {
      textAreaRef.current?.focus();
    }
  }, []);

  return (
    <form className="AddCourseTextSearch">
      <Tippy
        className="tippy-box--error"
        content={tsState.errorMsg}
        placement="bottom-start"
        arrow={false}
        duration={0}
        offset={[0, 5]}
        visible={tabIndex === 2 && !!tsState.errorMsg}
      >
        <textarea
          className="AddCourseTextSearch__textarea"
          placeholder="Text to search for UW course IDs"
          value={tsState.text}
          onChange={e => {
            setTsState(prev => ({
              ...prev,
              text: e.target.value.toUpperCase(),
              errorMsg: "",
            }));
          }}
          ref={textAreaRef}
          disabled={busy}
        ></textarea>
      </Tippy>

      <p>⚠️Added courses are placed below existing courses⚠️</p>
      <label>
        <input
          type="checkbox"
          checked={tsState.connectTo.prereq}
          disabled={busy}
          onChange={() =>
            tsUpdater.cb("connectTo", prev => ({
              ...prev.connectTo,
              prereq: !prev.connectTo.prereq,
            }))
          }
          data-cy="text-connect-to-prereqs"
        />
        Connect to existing prereqs
      </label>
      <label>
        <input
          type="checkbox"
          checked={tsState.connectTo.postreq}
          disabled={busy}
          onChange={() =>
            tsUpdater.cb("connectTo", prev => ({
              ...prev.connectTo,
              postreq: !prev.connectTo.postreq,
            }))
          }
          data-cy="text-connect-to-postreqs"
        />
        Connect to existing postreqs
      </label>

      <button
        type="submit"
        className="AddCourseTextSearch__add-courses-button"
        onClick={addCoursesFromText}
        disabled={busy || !tsState.text.trim()}
      >
        Add courses
      </button>
    </form>
  );
}
