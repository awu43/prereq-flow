import React, { useState } from "react";
import PropTypes from "prop-types";

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
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  // const [errorMsg, setErrorMsg] = useState("Foo");

  function close() {
    closeDialog();
    setTimeout(() => {
      setSelectedCourse("");
      // setErrorMsg("");
    }, 100);
  }

  function fetchCourse(event) {
    event.preventDefault();
    setBusy(true);
    fetch(`${API_URL}/courses/${selectedCourseId}`)
      .then(resp => resp.json())
      .then(data => {
        const node = newNode(data);
        node.position.x += (Math.random() - 0.5) * 100;
        node.position.y += (Math.random() - 0.5) * 100;
        // Add fuzzing to stop multiple nodes from piling
        addCourseNode(node);
      })
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
      <section>
        <h2>Add course</h2>
        <div className="course-search">
          {/* <input type="text" /> */}
          <input
            type="search"
            list="courses"
            id="course-select"
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
        </div>
      </section>
    </ModalDialog>
  );
}
AddCourseDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  nodeData: PropTypes.instanceOf(Map).isRequired,
  addCourseNode: PropTypes.func.isRequired,
};
