/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */

import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import ModalDialog from "./ModalDialog.jsx";
import { COURSE_REGEX, newNode } from "../parse-courses.js";
// import allCourses from "../data/all_courses.json";

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

// const courseList = new Set(allCourses);

// const courseOptions = allCourses.map(c => {
//   const courseId = c.match(COURSE_REGEX)[0];
//   return <option key={courseId}>{c}</option>;
// });

const SEARCH_REGEX = /\b(?:[A-Z&]+ )+\d{3}\b/g;

export default function AddCourseDialog({
  modalCls, closeDialog, nodeData, addCourseNode
}) {
  const [busy, setBusy] = useState(false);
  const [selectedOption, setSelectedOption] = useState("uw-course");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [autocompleteOpts, setAutocompleteOpts] = useState([]);

  const websocket = useRef(null);
  useEffect(() => {
    const wsConnection = new WebSocket(WS_URL);
    websocket.current = wsConnection;
    window.addEventListener("beforeunload", () => {
      wsConnection.close(1000);
    });
    wsConnection.addEventListener("message", event => {
      setAutocompleteOpts(
        JSON.parse(event.data).map(c => (
          <li
            key={c.match(COURSE_REGEX)[0]}
            onClick={() => {
              setSelectedCourse(c);
              setAutocompleteOpts([]);
            }}
            // TODO: Up/down keys (callback refs?)
            onKeyDown={e => {
              if (e.key === "Enter") {
                setSelectedCourse(c);
                setAutocompleteOpts([]);
              } else if (e.key === "Escape") {
                setAutocompleteOpts([]);
              }
            }}
            tabIndex="0"
          >
            {c}
          </li>
        ))
      );
    });
    return () => {
      wsConnection.close(1000);
    };
    // TODO: Proper error handling
  }, []);

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

  function close() {
    closeDialog();
    setTimeout(() => {
      setSelectedCourse("");
      setErrorMsg("");
      resetCustomCourseData();
    }, 100);
  }

  function onSearchChange(event) {
    setErrorMsg("");
    const newValue = event.target.value;
    setSelectedCourse(newValue);
    if (newValue.trim().length) {
      websocket.current.send(newValue);
    } else {
      setAutocompleteOpts([]);
    }
  }

  function addNewNode(data) {
    const node = newNode(data);
    node.position.x += (Math.random() - 0.5) * 200;
    node.position.y += (Math.random() - 0.5) * 200;
    // Add fuzzing to stop multiple nodes from piling
    addCourseNode(node);
  }

  async function fetchCourse(event) {
    event.preventDefault();
    // TODO: Add validation

    setAutocompleteOpts([]);

    const courseMatch = selectedCourse.match(SEARCH_REGEX);
    if (!courseMatch) {
      setErrorMsg("Invalid search");
      return;
    }

    const searchQuery = courseMatch[0];
    if (nodeData.has(searchQuery)) {
      setErrorMsg("Course already exists");
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

    // fetch(`${API_URL}/courses/${searchQuery}`)
    //   // .then(resp => resp.json())
    //   .then(resp => {
    //     if (resp.ok) {

    //     } else if (resp.status === 404) {
    //       throw Error("Course not found");
    //     } else {
    //       throw Error("Something went wrong");
    //     }
    //   })
    // .then(data => addNewNode(data))
    // .then(() => {
    //   setSelectedCourse("");
    //   setBusy(false);
    // })
    // .catch(err => {
    //   console.error(err);
    //   setErrorMsg(err.message);
    // });
    // TODO: Proper error handling
  }

  function addCustomCourse() {
    setBusy(true);
    addNewNode(customCourseData);
    resetCustomCourseData();
    setBusy(false);
  }

  // TODO: Custom autocomplete
  const uwCourseForm = (
    <form className="add-uw-course">
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
          <input
            type="search"
            // list="courses"
            className="add-uw-course__searchbar"
            placeholder="Course ID"
            value={selectedCourse}
            onChange={onSearchChange}
            disabled={busy}
            onClick={() => {
              setAutocompleteOpts([]);
            }}
            onKeyDown={event => {
              if (event.key === "Escape") {
                setAutocompleteOpts([]);
              }
            }}
          />
        </Tippy>
        {/* <datalist id="courses">{autocompleteOpts}</datalist>
         */}
        {
          Boolean(autocompleteOpts.length)
          && <ul className="add-uw-course__autocomplete">{autocompleteOpts}</ul>
        }
        <button
          className="add-uw-course__add-button"
          type="submit"
          disabled={busy}
          onClick={fetchCourse}
        >
          Add
        </button>
      </div>
      <p>Not all courses are available. See <a href="https://github.com/awu43/prereq-flow#supported-courses" target="_blank" rel="noreferrer">README</a> for&nbsp;details.</p>
    </form>
  );

  const customCourseForm = (
    <form className="add-custom-course">
      <div className="add-custom-course__header-row">
        <Tippy
          className="tippy-box--error"
          content="Course already exists"
          placement="bottom"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={nodeData.has(customCourseData.id)}
        >
          <input
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

  const displayedForm = (
    selectedOption === "uw-course"
      ? uwCourseForm
      : customCourseForm
  );

  return (
    <ModalDialog modalCls={modalCls} dlgCls="AddCourseDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className="close-button"
        onClick={close}
        disabled={busy}
      >
      </button>
      <h2>Add course</h2>
      <fieldset className="course-type-select">
        <label className="course-type-select__uw-label">
          <input
            type="radio"
            className="course-type-select__uw-radio"
            name="course-type"
            value="uw-course"
            checked={selectedOption === "uw-course"}
            onChange={e => setSelectedOption(e.target.value)}
          />
          UW course
        </label>
        <label className="course-type-select__custom-label">
          <input
            type="radio"
            className="course-type-select__custom-radio"
            name="course-type"
            value="custom-course"
            checked={selectedOption === "custom-course"}
            onChange={e => setSelectedOption(e.target.value)}
          />
          Custom course
        </label>
      </fieldset>
      {displayedForm}
    </ModalDialog>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  nodeData: PropTypes.instanceOf(Map).isRequired,
  addCourseNode: PropTypes.func.isRequired,
};
