import React, { useState } from "react";
import PropTypes from "prop-types";

import ModalDialog from "./ModalDialog.jsx";
import PreWarning from "./PreWarning.jsx";
import DegreeSelect from "./DegreeSelect.jsx";
// import CourseSelect from "./CourseSelect.jsx";

import { generateInitialElements } from "./data/parse-courses.js";

export default function NewFlowDialog({
  modalCls, closeDialog, generateNewFlow
}) {
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);

  // const [courseData, setCourseData] = useState({});

  function close() {
    closeDialog();
    setTimeout(() => {
      setSlideState(0);
    }, 100);
  }

  function acceptWarning() {
    setWarningAccepted(1);
  }

  // function advanceSlide() {
  //   setSlideState(slideState + 1);
  // }

  function onCoursesFetched(fetchedData) {
    // setCourseData(fetchedData);
    const newElements = generateInitialElements(fetchedData);
    generateNewFlow(newElements);
    close();
    // advanceSlide();
    setTimeout(() => {
      setBusy(false);
    }, 250);
  }

  const slideNum = warningAccepted + slideState;

  return (
    <ModalDialog modalCls={modalCls} dlgCls="NewFlowDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className="close-button"
        onClick={close}
        disabled={busy}
      >
      </button>
      <h2>New flow</h2>
      <hr />
      <div className={`NewFlowDialog__slides slide-${slideNum}`}>
        <PreWarning accept={acceptWarning} />
        <DegreeSelect
          busy={busy}
          setBusy={setBusy}
          advance={onCoursesFetched}
        />
        {/* <CourseSelect
          courseData={courseData}
          generateNewFlow={generateNewFlow}
        /> */}
      </div>
      {/* Flex, 3x width + transform */}
    </ModalDialog>
  );
}
NewFlowDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  generateNewFlow: PropTypes.func.isRequired,
};
