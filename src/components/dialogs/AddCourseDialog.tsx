import React, { useState, useRef, useEffect } from "react";
import type { MouseEvent, KeyboardEvent, ChangeEvent } from "react";

import { DialogOverlay, DialogContent } from "@reach/dialog";
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
  NodeDataMap,
  ModalClass,
  CloseModal,
  ConnectTo,
  NewCoursePosition,
} from "types/main";

import "./AddCourseDialog.scss";
import CloseButton from "./CloseButton";
import CampusSelect from "./CampusSelect";
import CustomCourseForm from "./CustomCourseForm";
import AddCourseTextSearch from "./AddCourseTextSearch";
import usePrefersReducedMotion from "../../usePrefersReducedMotion";
import { newCourseNode } from "../../utils";

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

const SEARCH_REGEX = /^\s*((?:[A-Z&]+ )+\d{3})(?:\D+|$)/;
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
}
export default function AddCourseDialog({
  modalCls,
  closeDialog,
  nodeData,
  addCourseNode,
}: AddCourseDialogProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus>("Seattle");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        // Don't reset selected options
        setSelectedCourse("");
        setAutocompleteOpts([]);
      }, 100);
    } else {
      setSelectedCourse("");
      setAutocompleteOpts([]);
    }
  }

  function onSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    // Heroku responds fast enough, no throttling/debouncing needed
    setErrorMsg("");
    const newValue = event.target.value.toUpperCase();
    setSelectedCourse(newValue);
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

    const courseMatch = selectedCourse.match(SEARCH_REGEX);
    if (!courseMatch) {
      setErrorMsg("Invalid course ID");
      searchBarRef.current?.focus();
      return;
    }

    const searchQuery = courseMatch[1];
    if (nodeData.has(searchQuery)) {
      setErrorMsg("Course already exists");
      searchBarRef.current?.focus();
      return;
    }

    setErrorMsg("");
    setBusy(true);

    try {
      const resp = await fetch(`${API_URL}/courses/${searchQuery}`);
      if (resp.ok) {
        addNewNode(await resp.json(), alwaysAtZero ? "zero" : "relative");
        setSelectedCourse("");
      } else if (resp.status === 404) {
        setErrorMsg("Course not found");
      } else {
        setErrorMsg("Something went wrong");
      }
    } catch (_error) {
      setErrorMsg("Something went wrong");
    }

    setBusy(false);
    searchBarRef.current?.focus();
  }

  const uwCourseForm = (
    <form className="add-uw-course">
      <CampusSelect
        selectedCampus={selectedCampus}
        setSelectedCampus={setSelectedCampus}
        busy={busy}
      />
      <div className="add-uw-course__bar-and-button">
        <Tippy
          className="tippy-box--error"
          content={errorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={tabIndex === 0 && !!errorMsg}
        >
          <Combobox
            onSelect={item => { setSelectedCourse(item); }}
            aria-label="Course search"
          >
            <ComboboxInput
              className="add-uw-course__searchbar"
              ref={searchBarRef}
              placeholder="Course ID (Enter key to add)"
              value={selectedCourse}
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
          className="add-uw-course__add-button"
          ref={addButtonRef}
          type="submit"
          disabled={Boolean(connectionError || busy)}
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
    </form>
  );

  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      onDismiss={event => {
        if ((event as KeyboardEvent).key === "Escape" && !busy) {
          closeDialog();
        }
        // Don't close on clicking modal background
      }}
    >
      <DialogContent className="AddCourseDialog" aria-label="Add course dialog">
        <CloseButton onClick={close} disabled={busy} />
        <h2 className={connectionError ? "connection-error" : ""}>
          Add course
        </h2>
        <Tabs onChange={i => setTabIndex(i)}>
          <TabList>
            <Tab disabled={busy}>UW course</Tab>
            <Tab disabled={busy}>Custom course</Tab>
            <Tab disabled={busy}>Text search</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>{uwCourseForm}</TabPanel>
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
                connectionError={connectionError}
                busy={busy}
                setBusy={setBusy}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </DialogContent>
    </DialogOverlay>
  );
}
