import React, { useState } from "react";
import PropTypes from "prop-types";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import ModalDialog from "./ModalDialog.jsx";

import allCourses from "./data/all_courses.json";
import { COURSE_REGEX, newNode } from "./data/parse-courses.js";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

const courseList = new Set(allCourses);

const courseOptions = allCourses.map(c => {
  const courseId = c.match(COURSE_REGEX)[0];
  return <option key={courseId}>{c}</option>;
});

export default function AddCourseDialog({
  modalCls, closeDialog, nodeData, addCourseNode
}) {
  const [busy, setBusy] = useState(false);
  const [selectedOption, setSelectedOption] = useState("uw-course");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  // const [errorMsg, setErrorMsg] = useState("Foo");

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
      // Don't reset selectedOption
      setSelectedCourse("");
      setSelectedCourseId("");
      // setErrorMsg("");
      resetCustomCourseData();
    }, 100);
  }

  function addNewNode(data) {
    const node = newNode(data);
    node.position.x += (Math.random() - 0.5) * 200;
    node.position.y += (Math.random() - 0.5) * 200;
    // Add fuzzing to stop multiple nodes from piling
    addCourseNode(node);
  }

  function fetchCourse(event) {
    event.preventDefault();
    setBusy(true);
    fetch(`${API_URL}/courses/${selectedCourseId}`)
      .then(resp => resp.json())
      .then(data => addNewNode(data))
      .then(() => {
        setSelectedCourse("");
        setSelectedCourseId("");
        setBusy(false);
      })
      .catch(error => {
        console.error("Error:", error);
      });
    // TODO: Proper error handling
  }

  function addCustomCourse() {
    setBusy(true);
    addNewNode(customCourseData);
    resetCustomCourseData();
    setBusy(false);
  }

  const uwCourseForm = (
    <form className="add-uw-course">
      <div className="add-uw-course__bar-and-button">
        <Tippy
          className="tippy-box--error"
          content="Course already exists"
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={nodeData.has(selectedCourseId)}
        >
          <input
            type="search"
            list="courses"
            className="add-uw-course__searchbar"
            placeholder="Course ID or name"
            value={selectedCourse}
            onChange={e => {
              const newValue = e.target.value;
              setSelectedCourse(newValue);
              const match = newValue.match(COURSE_REGEX);
              setSelectedCourseId(match ? match[0] : "");
            }}
            disabled={busy}
          />
        </Tippy>
        <datalist id="courses">
          {courseOptions}
        </datalist>
        <button
          className="add-uw-course__add-button"
          type="submit"
          disabled={
            (
              !courseList.has(selectedCourse)
              || nodeData.has(selectedCourseId)
            )
            || busy
          }
          onClick={fetchCourse}
        >
          Add
        </button>
      </div>
      <p>Not all courses are available. See <a href="https://github.com/andrew-1135/prereq-flow#supported-courses" target="_blank" rel="noreferrer">README</a> for&nbsp;details.</p>
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
