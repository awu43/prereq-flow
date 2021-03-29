import React, { useState } from "react";
import PropTypes from "prop-types";

import ModalDialog from "./ModalDialog.jsx";

import allCourses from "./data/all_courses.json";
import { COURSE_REGEX } from "./data/parse-courses.js";

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

export default function AddCourseDialog({ modalCls, closeDialog }) {
  const [selectedCourse, setSelectedCourse] = useState("");

  function close() {
    closeDialog();
    setTimeout(() => {
      setSelectedCourse("");
    }, 100);
  }

  function fetchCourse() {
    const courseId = selectedCourse.match(COURSE_REGEX)[0];
    fetch(`${API_URL}/courses/${courseId}`)
      .then(resp => resp.json())
      .catch(error => {
        console.error("Error:", error);
      });
    // TODO: Proper error handling
  }

  return (
    <ModalDialog modalCls={modalCls} dlgCls="AddCourseDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button type="button" className="close-button" onClick={close}></button>
      <section>
        <h2>Add course</h2>
        <div className="course-search">
          {/* <input type="text" /> */}
          <input
            type="search"
            list="courses"
            id="course-select"
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
          />
          <datalist id="courses">
            {courseOptions}
          </datalist>
          <button
            type="submit"
            disabled={!courseList.has(selectedCourse)}
            onClick={fetchCourse}
          >
            Add
          </button>
        </div>
      </section>
    </ModalDialog>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
};
