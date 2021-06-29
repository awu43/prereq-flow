import React, { useState, useRef, useEffect } from "react";
import type { MouseEvent, ChangeEvent } from "react";

import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import "@reach/tabs/styles.css";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
} from "@reach/combobox";
import type { ComboboxOptionProps } from "@reach/combobox";
import "@reach/combobox/styles.css";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  Campus,
  CourseData,
  CourseNode,
  Element,
  NodeDataMap,
  ConnectTo,
  NewCoursePosition,
} from "types/main";
import type { ModalClass, CloseModal } from "@useDialogStatus";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import {
  newCourseNode,
  generateInitialElements,
} from "@utils";
import "./AddCourseDialog.scss";
import ModalDialog from "./ModalDialog";
import CampusSelect from "./CampusSelect";
import CustomCourseForm from "./CustomCourseForm";
import AddCourseTextSearch from "./AddCourseTextSearch";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

const WS_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_WS_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_WS_URL
);

const SEARCH_REGEX = /^\s*(?:[A-Z&]+ )+\d{3}\b/;
// Strips away leading whitespace
// Will not match if >3 numbers in ID

interface AddCourseDialogProps {
  modalCls: ModalClass;
  closeDialog: CloseModal;
  nodeData: NodeDataMap;
  addCourseNode: (
    newNode: CourseNode,
    connectTo: ConnectTo,
    newCoursePosition: NewCoursePosition,
  ) => void;
  addExternalFlow: (extElems: Element[], connectTo: ConnectTo) => void;
}
export default function AddCourseDialog({
  modalCls,
  closeDialog,
  nodeData,
  addCourseNode,
  addExternalFlow,
}: AddCourseDialogProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus>("Seattle");

  const [searchbarInput, setSearchbarInput] = useState("");
  const [uwCourseErrorMsg, setUwErrorMsg] = useState("");
  const [textSearchErrorMsg, setTextSearchErrorMsg] = useState("");

  const [
    autocompleteOpts,
    setAutocompleteOpts
  ] = useState<ComboboxOptionProps[]>([]);

  const searchBarRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31065#issuecomment-446425911
  const websocket = useRef<WebSocket | null>(null);
  useEffect(() => {
    const wsConnection = new WebSocket(WS_URL);
    websocket.current = wsConnection;
    window.addEventListener("beforeunload", () => {
      wsConnection.close(1000);
    });
    wsConnection.addEventListener("message", event => {
      setAutocompleteOpts(
        JSON.parse(event.data).map((courseData: CourseData) => (
          <ComboboxOption key={courseData.id} value={courseData.id}>
            <ComboboxOptionText />: {courseData.name}
          </ComboboxOption>
        ))
      );
    });
    wsConnection.addEventListener("error", event => {
      setConnectionError(true);
      // eslint-disable-next-line no-console
      console.error(event);
    });
    return () => {
      wsConnection.close(1000);
    };
  }, []);

  const [connectTo, setConnectTo] = useState<ConnectTo>({
    prereq: true,
    postreq: true,
  });
  const [alwaysAtZero, setAlwaysAtZero] = useState(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  function close(): void {
    setUwErrorMsg("");
    setTextSearchErrorMsg("");
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setTabIndex(0);
        setSearchbarInput("");
        setAutocompleteOpts([]);
      }, 100);
    } else {
      setTabIndex(0);
      setSearchbarInput("");
      setAutocompleteOpts([]);
    }
  }

  function onSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    // Heroku responds fast enough, no throttling/debouncing needed
    setUwErrorMsg("");
    const newValue = event.target.value.toUpperCase();
    setSearchbarInput(newValue);
    if (newValue.trim() && websocket.current) {
      websocket.current.send(
        JSON.stringify({ campus: selectedCampus, id: `${newValue.trim()} ` })
      );
      // Adding a trailing space seems to improve accuracy for some reason
    } else {
      setAutocompleteOpts([]);
    }
  }

  function addNewNode(
    data: CourseData,
    position: NewCoursePosition
  ): void {
    const node = newCourseNode(data);
    node.position = {
      x: Math.random() * 150,
      y: Math.random() * 300
    };
    // Add fuzzing to stop multiple nodes from piling
    addCourseNode(node, connectTo, position);
  }

  async function fetchCourse(event: MouseEvent): Promise<void> {
    event.preventDefault();

    if (!searchbarInput.trim()) {
      return;
    }

    const courseMatch = searchbarInput.match(SEARCH_REGEX);
    if (!courseMatch) {
      setUwErrorMsg("Invalid course ID");
      searchBarRef.current?.focus();
      return;
    }

    const searchQuery = courseMatch[0].trim();
    if (nodeData.has(searchQuery)) {
      setUwErrorMsg("Course already exists");
      searchBarRef.current?.focus();
      return;
    }

    setUwErrorMsg("");
    setBusy(true);

    try {
      const resp = await fetch(`${API_URL}/courses/${searchQuery}`);
      if (resp.ok) {
        addNewNode(await resp.json(), alwaysAtZero ? "zero" : "relative");
        setSearchbarInput("");
      } else if (resp.status === 404) {
        setUwErrorMsg("Course not found");
      } else {
        setUwErrorMsg("Something went wrong");
      }
    } catch (_error) {
      setUwErrorMsg("Something went wrong");
    }

    setBusy(false);
    searchBarRef.current?.focus();
  }

  async function addCoursesFromText(
    matches: RegExpMatchArray,
    connect: ConnectTo,
  ): Promise<boolean> {
    setTextSearchErrorMsg("");
    setBusy(true);

    if (!matches.length) {
      setTextSearchErrorMsg("No course IDs found");
      setBusy(false);
      return false;
    }

    const courses = matches.filter(m => !nodeData.has(m));
    if (!courses.length) {
      setTextSearchErrorMsg("All found courses already exist");
      setBusy(false);
      return false;
    }

    try {
      const resp = await fetch(`${API_URL}/courses/`, {
        method: "POST",
        headers: { contentType: "application/json" },
        body: JSON.stringify(courses),
      });

      if (resp.status === 404) {
        setTextSearchErrorMsg("No matching courses found");
        setBusy(false);
        return false;
      }

      const data = await resp.json();

      const newElements = generateInitialElements(data, "aggressively");
      addExternalFlow(newElements, connect);
      setBusy(false);
      return true;
    } catch (error) {
      setTextSearchErrorMsg("Something went wrong");
      // eslint-disable-next-line no-console
      console.error(error);
      setBusy(false);
      return false;
    }
  }

  const uwCourseForm = (
    <form className="UwCourseForm">
      <CampusSelect
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        busy={busy}
      />
      <div className="UwCourseForm__bar-and-button">
        <Tippy
          className="tippy-box--error"
          content={uwCourseErrorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={tabIndex === 0 && !!uwCourseErrorMsg}
        >
          <Combobox
            onSelect={item => { setSearchbarInput(item); }}
            aria-label="Course search"
          >
            <ComboboxInput
              className="UwCourseForm__searchbar"
              ref={searchBarRef}
              placeholder="Course ID (Enter key to add)"
              value={searchbarInput}
              onChange={onSearchChange}
              disabled={Boolean(connectionError || busy)}
            />
            <ComboboxPopover>
              <ComboboxList>
                {autocompleteOpts}
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
        </Tippy>
        <button
          className="UwCourseForm__add-button"
          ref={addButtonRef}
          type="submit"
          disabled={Boolean(connectionError || busy || !searchbarInput.trim())}
          onClick={fetchCourse}
        >
          Add
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={connectTo.prereq}
          disabled={busy}
          onChange={() => {
            setConnectTo(prev => ({ ...prev, prereq: !prev.prereq }));
          }}
          data-cy="uw-connect-to-prereqs"
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
          data-cy="uw-connect-to-postreqs"
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
    </form>
  );

  return (
    <ModalDialog
      modalCls={modalCls}
      close={close}
      busy={busy}
      contentCls="AddCourseDialog"
      contentAriaLabel="Add course dialog"
    >
      <h2 className={connectionError ? "connection-error" : ""}>
        Add courses
      </h2>
      <Tabs onChange={i => setTabIndex(i)}>
        <TabList>
          <Tab disabled={busy}>UW course</Tab>
          <Tab disabled={busy}>Custom course</Tab>
          <Tab disabled={busy}>Text search</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {uwCourseForm}
          </TabPanel>
          <TabPanel className="AddCourseDialog__custom-course-tab-panel">
            <CustomCourseForm
              tabIndex={tabIndex}
              busy={busy}
              setBusy={setBusy}
              nodeData={nodeData}
              addNewNode={addNewNode}
            />
          </TabPanel>
          <TabPanel className="AddCourseDialog__text-search-tab-panel">
            <AddCourseTextSearch
              tabIndex={tabIndex}
              connectionError={connectionError}
              errorMsg={textSearchErrorMsg}
              setErrorMsg={setTextSearchErrorMsg}
              busy={busy}
              addCoursesFromText={addCoursesFromText}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </ModalDialog>
  );
}
