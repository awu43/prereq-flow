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
  const [selectedOption, setSelectedOption] = useState("custom-course");

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
    node.position.x += (Math.random() - 0.5) * 100;
    node.position.y += (Math.random() - 0.5) * 100;
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

  const courseSearchSection = (
    <section className="course-search">
      <input
        type="search"
        list="courses"
        id="course-select"
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
      <datalist id="courses">
        {courseOptions}
      </datalist>
      {/* <p>{errorMsg}</p> */}
      <button
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
    </section>
  );

  const customCourseSection = (
    <section className="custom-course">
      <div className="header-row">
        <Tippy
          className="course-already-exists"
          content="Course already exists"
          placement="bottom"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={nodeData.has(customCourseData.id)}
        >
          <input
            className="custom-id"
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
          className="custom-name"
          type="text"
          placeholder="Course name"
          value={customCourseData.name}
          onChange={e => setCustomCourseData({
            ...customCourseData, name: e.target.value
          })}
        />
        <input
          className="custom-credits"
          type="text"
          placeholder="Credits"
          value={customCourseData.credits}
          onChange={e => setCustomCourseData({
            ...customCourseData, credits: e.target.value
          })}
        />
      </div>
      <textarea
        className="custom-description"
        placeholder="Description"
        value={customCourseData.description}
        onChange={e => setCustomCourseData({
          ...customCourseData, description: e.target.value
        })}
      >
      </textarea>
      <div className="footer-row">
        <input
          className="custom-prerequisite"
          type="text"
          placeholder="Prerequisite"
          value={customCourseData.prerequisite}
          onChange={e => setCustomCourseData({
            ...customCourseData, prerequisite: e.target.value
          })}
        />
        <input
          className="custom-offered"
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
        className="add-custom-button"
        onClick={addCustomCourse}
        disabled={
          !customCourseData.id.trim().length
          || nodeData.has(customCourseData.id)
        }
      >
        Add custom course
      </button>
    </section>
  );

  const displayedSection = (
    selectedOption === "uw-course"
      ? courseSearchSection
      : customCourseSection
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
      <fieldset>
        <label className="uw-course-radio">
          <input
            type="radio"
            name="course-type"
            value="uw-course"
            checked={selectedOption === "uw-course"}
            onChange={e => setSelectedOption(e.target.value)}
          />
          UW course
        </label>
        <label className="custom-course-radio">
          <input
            type="radio"
            name="course-type"
            value="custom-course"
            checked={selectedOption === "custom-course"}
            onChange={e => setSelectedOption(e.target.value)}
          />
          Custom course
        </label>
      </fieldset>
      {displayedSection}
    </ModalDialog>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  nodeData: PropTypes.instanceOf(Map).isRequired,
  addCourseNode: PropTypes.func.isRequired,
};
