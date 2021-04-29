import React, { useState } from "react";
import PropTypes from "prop-types";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import PreWarning from "./PreWarning.jsx";
import DegreeSelect from "./DegreeSelect.jsx";
// import CourseSelect from "./CourseSelect.jsx";
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";

import { generateInitialElements } from "../parse-courses.js";

export default function NewFlowDialog({
  modalCls, closeDialog, supportedMajors, generateNewFlow
}) {
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  function close() {
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setSlideState(0);
      }, 100);
    } else {
      setSlideState(0);
    }
  }

  function acceptWarning() {
    setWarningAccepted(1);
  }

  // TODO: Disable focusable elements on hidden slides
  // function advanceSlide() {
  //   setSlideState(slideState + 1);
  // }

  function onCoursesFetched(fetchedData) {
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
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      onDismiss={event => {
        if (event.key === "Escape") {
          closeDialog();
        }
      }}
    >
      <DialogContent className="NewFlowDialog" aria-label="New flow dialog">
        <button
          type="button"
          className="close-button"
          onClick={close}
          disabled={busy}
        >
          <img src="dist/icons/x-black.svg" alt="close" />
        </button>
        <h2>New flow</h2>
        <hr />
        <div
          className={`NewFlowDialog__slides slide-${slideNum}`}
        >
          <PreWarning accept={acceptWarning} />
          <DegreeSelect
            supportedMajors={supportedMajors}
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
      </DialogContent>
    </DialogOverlay>
  );
}
NewFlowDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  supportedMajors: PropTypes.arrayOf(PropTypes.string).isRequired,
  generateNewFlow: PropTypes.func.isRequired,
};
