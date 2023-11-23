import { useRef, useEffect } from "react";
import type { ChangeEvent, MouseEvent, MutableRefObject } from "react";

import Fuse from "fuse.js";
import { useAtomValue } from "jotai";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type { CourseData, SetState } from "types/main";

import { courseDataAtom } from "@state";
import { stateUpdater } from "@utils";

import CampusSelect from "../CampusSelect";

import type { UwCourseFormState } from "./types";
import "./UwCourseForm.scss";

interface UwCourseFormProps {
  tabIndex: number;
  uwcfState: UwCourseFormState;
  setUwcfState: SetState<UwCourseFormState>;
  autocompleteOpts: JSX.Element[];
  setAutocompleteOpts: SetState<JSX.Element[]>;
  fetchCourse: (event: MouseEvent) => Promise<void>;
  busy: boolean;
  focusSearchRef: MutableRefObject<() => void>;
}
export default function UwCourseForm({
  tabIndex,
  uwcfState,
  setUwcfState,
  autocompleteOpts,
  setAutocompleteOpts,
  fetchCourse,
  busy,
  focusSearchRef,
}: UwCourseFormProps): JSX.Element {
  const uwcfUpdater = stateUpdater(setUwcfState);

  const courseData = useAtomValue(courseDataAtom);
  const fuseRef = useRef<Fuse<CourseData>>(new Fuse([], { keys: ["id"] }));
  useEffect(() => {
    fuseRef.current.setCollection(courseData);
  }, [courseData]);

  const searchBarRef = useRef<HTMLInputElement>(null);

  function focusSearchInput(): void {
    searchBarRef.current?.focus();
  }

  useEffect(() => {
    if (tabIndex === 0) {
      focusSearchInput();
    }
  }, []);

  useEffect(() => {
    focusSearchRef.current = focusSearchInput;
  }, []);

  function onSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    const newValue = event.target.value.toUpperCase();
    setUwcfState(prev => ({ ...prev, searchText: newValue, errorMsg: "" }));
    if (newValue.trim()) {
      const results = fuseRef.current
        .search(newValue.trim())
        .slice(0, 10)
        .map(f => f.item);
      setAutocompleteOpts(
        results.map(data => (
          <ComboboxOption key={data.id} value={data.id}>
            <ComboboxOptionText />: {data.name}
          </ComboboxOption>
        )),
      );
    } else {
      setAutocompleteOpts([]);
    }
  }

  return (
    <form className="UwCourseForm">
      <CampusSelect
        selectedCampus={uwcfState.campus}
        setSelectedCampus={c => uwcfUpdater.value("campus", c)}
        busy={busy}
      />
      <div className="UwCourseForm__bar-and-button">
        <Tippy
          className="tippy-box--error"
          content={uwcfState.errorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={tabIndex === 0 && !!uwcfState.errorMsg}
        >
          <Combobox
            onSelect={item => uwcfUpdater.value("searchText", item)}
            aria-label="Course search"
          >
            <ComboboxInput
              className="UwCourseForm__searchbar"
              ref={searchBarRef}
              placeholder="Course ID (Enter key to add)"
              value={uwcfState.searchText}
              onChange={onSearchChange}
              disabled={busy}
            />
            <ComboboxPopover>
              <ComboboxList>{autocompleteOpts}</ComboboxList>
            </ComboboxPopover>
          </Combobox>
        </Tippy>
        <button
          className="UwCourseForm__add-button"
          type="submit"
          disabled={busy || !uwcfState.searchText.trim()}
          onClick={fetchCourse}
        >
          Add
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={uwcfState.connectTo.prereq}
          disabled={busy}
          onChange={() =>
            uwcfUpdater.transform("connectTo", prev => ({
              ...prev.connectTo,
              prereq: !prev.connectTo.prereq,
            }))
          }
          data-cy="uw-connect-to-prereqs"
        />
        Connect to existing prereqs
      </label>
      <label>
        <input
          type="checkbox"
          checked={uwcfState.connectTo.postreq}
          disabled={busy}
          onChange={() =>
            uwcfUpdater.transform("connectTo", prev => ({
              ...prev.connectTo,
              postreq: !prev.connectTo.postreq,
            }))
          }
          data-cy="uw-connect-to-postreqs"
        />
        Connect to existing postreqs
      </label>
      <label>
        <input
          type="checkbox"
          checked={uwcfState.alwaysAtZero}
          disabled={busy}
          onChange={() =>
            uwcfUpdater.transform("alwaysAtZero", prev => !prev.alwaysAtZero)
          }
        />
        Always place new courses at (0, 0)
      </label>
    </form>
  );
}
