import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

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
import "@reach/combobox/styles.css";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import CampusSelect from "./CampusSelect.jsx";
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";
import { newCourseNode } from "../parse-courses.js";

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

export default function AddCourseDialog({
  modalCls, closeDialog, nodeData, addCourseNode
}) {
  const [connectionError, setConnectionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState("Seattle");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [autocompleteOpts, setAutocompleteOpts] = useState([]);

  const searchBarRef = useRef(null);
  const addButtonRef = useRef(null);
  const customCourseIdRef = useRef(null);

  const websocket = useRef(null);
  useEffect(() => {
    const wsConnection = new WebSocket(WS_URL);
    websocket.current = wsConnection;
    window.addEventListener("beforeunload", () => {
      wsConnection.close(1000);
    });
    wsConnection.addEventListener("message", event => {
      setAutocompleteOpts(
        JSON.parse(event.data).map(courseData => (
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

  const [connectToExisting, setConnectToExisting] = useState(true);
  const [newCoursePosition, setNewCoursePosition] = useState("relative");

  const [customCourseData, setCustomCourseData] = useState({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

  function resetCustomCourseData() {
    setCustomCourseData({
      id: "",
      name: "",
      credits: "",
      description: "",
      prerequisite: "",
      offered: "",
    });
  }

  const prefersReducedMotion = usePrefersReducedMotion();
  function close() {
    setErrorMsg("");
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        // Don't reset selected options
        setSelectedCourse("");
        setAutocompleteOpts([]);
        resetCustomCourseData();
      }, 100);
    } else {
      setSelectedCourse("");
      setAutocompleteOpts([]);
      resetCustomCourseData();
    }
  }

  function onSearchChange(event) {
    // Heroku responds fast enough, no throttling/debouncing needed
    setErrorMsg("");
    const newValue = event.target.value.toUpperCase();
    setSelectedCourse(newValue);
    if (newValue.trim().length) {
      websocket.current.send(
        JSON.stringify({ campus: selectedCampus, id: `${newValue.trim()} ` })
      );
      // Adding a trailing space seems to improve accuracy for some reason
    } else {
      setAutocompleteOpts([]);
    }
  }

  function addNewNode(data) {
    const node = newCourseNode(data);
    if (newCoursePosition === "zero") {
      node.position.x += (Math.random() - 0.5) * 200;
      node.position.y += (Math.random() - 0.5) * 200;
      // Add fuzzing to stop multiple nodes from piling
    }
    addCourseNode(node, connectToExisting, newCoursePosition);
  }

  async function fetchCourse(event) {
    event.preventDefault();

    const courseMatch = selectedCourse.match(SEARCH_REGEX);
    if (!courseMatch) {
      setErrorMsg("Invalid course ID");
      searchBarRef.current.focus();
      return;
    }

    const searchQuery = courseMatch[1];
    if (nodeData.has(searchQuery)) {
      setErrorMsg("Course already exists");
      searchBarRef.current.focus();
      return;
    }

    setErrorMsg("");
    setBusy(true);

    try {
      const resp = await fetch(`${API_URL}/courses/${searchQuery}`);
      if (resp.ok) {
        addNewNode(await resp.json());
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
    searchBarRef.current.focus();
  }

  function addCustomCourse() {
    setBusy(true);
    addNewNode(customCourseData);
    resetCustomCourseData();
    setBusy(false);
    customCourseIdRef.current.focus();
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
          visible={errorMsg.length}
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
              disabled={connectionError || busy}
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
          disabled={connectionError || busy}
          onClick={fetchCourse}
        >
          Add
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={connectToExisting}
          disabled={busy}
          onChange={() => {
            if (connectToExisting) {
              // About to be disabled
              setNewCoursePosition("zero");
            }
            setConnectToExisting(!connectToExisting);
          }}
        />
        Connect to existing pre/postreqs
      </label>
      <div className="add-uw-course__connection-opts">
        {/* <div className={`connection-opts__cover ${!connectToExisting || busy ? "--enabled" : ""}`}></div> */}
        <fieldset
          className="connection-opts__position"
          disabled={busy}
        >
          <legend>New courses should be placed</legend>
          <label>
            <input
              type="radio"
              name="new-position"
              checked={newCoursePosition === "relative"}
              onChange={() => setNewCoursePosition("relative")}
              disabled={!connectToExisting}
            />
            Relative to pre/postreqs
          </label>
          <label>
            <input
              type="radio"
              name="new-position"
              value="zero"
              checked={newCoursePosition === "zero"}
              onChange={() => setNewCoursePosition("zero")}
            />
            At (0, 0) position
          </label>
        </fieldset>
      </div>
    </form>
  );

  const customCourseForm = (
    <form className="add-custom-course">
      <div className="add-custom-course__header-row">
        <Tippy
          className="tippy-box--error"
          content="Course already exists"
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={nodeData.has(customCourseData.id)}
        >
          <input
            ref={customCourseIdRef}
            className="add-custom-course__id-input"
            type="text"
            required={true}
            placeholder="Course ID (required)"
            value={customCourseData.id}
            onChange={e => setCustomCourseData({
              ...customCourseData, id: e.target.value
            })}
          />
        </Tippy>
        <input
          className="add-custom-course__name-input"
          type="text"
          placeholder="Course name"
          value={customCourseData.name}
          onChange={e => setCustomCourseData({
            ...customCourseData, name: e.target.value
          })}
        />
        <input
          className="add-custom-course__credits-input"
          type="text"
          placeholder="Credits"
          value={customCourseData.credits}
          onChange={e => setCustomCourseData({
            ...customCourseData, credits: e.target.value
          })}
        />
      </div>
      <textarea
        className="add-custom-course__description-input"
        placeholder="Description"
        value={customCourseData.description}
        onChange={e => setCustomCourseData({
          ...customCourseData, description: e.target.value
        })}
      >
      </textarea>
      <div className="add-custom-course__footer-row">
        <input
          className="add-custom-course__prerequisite-input"
          type="text"
          placeholder="Prerequisite"
          value={customCourseData.prerequisite}
          onChange={e => setCustomCourseData({
            ...customCourseData, prerequisite: e.target.value
          })}
        />
        <input
          className="add-custom-course__offered-input"
          type="text"
          placeholder="Offered"
          value={customCourseData.offered}
          onChange={e => setCustomCourseData({
            ...customCourseData, offered: e.target.value
          })}
        />
      </div>
      <button
        type="button"
        className="add-custom-course__add-button"
        onClick={addCustomCourse}
        disabled={
          !customCourseData.id.trim().length
          || nodeData.has(customCourseData.id)
        }
      >
        Add custom course
      </button>
    </form>
  );

  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      onDismiss={event => {
        if (event.key === "Escape" && !busy) {
          closeDialog();
        }
        // Don't close on clicking modal background
      }}
    >
      <DialogContent className="AddCourseDialog" aria-label="Add course dialog">
        <button
          type="button"
          className="close-button"
          onClick={close}
          disabled={busy}
        >
          <img src="dist/icons/x-black.svg" alt="close" />
        </button>
        <h2 className={connectionError ? "connection-error" : ""}>
          Add course
        </h2>
        <Tabs onChange={() => setErrorMsg("")}>
          <TabList>
            <Tab disabled={busy}>UW course</Tab>
            <Tab disabled={busy}>Custom course</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>{uwCourseForm}</TabPanel>
            <TabPanel>{customCourseForm}</TabPanel>
          </TabPanels>
        </Tabs>
      </DialogContent>
    </DialogOverlay>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  nodeData: PropTypes.instanceOf(Map).isRequired,
  addCourseNode: PropTypes.func.isRequired,
};
