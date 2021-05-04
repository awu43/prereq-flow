import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import PreWarning from "./PreWarning.jsx";
import FlowType from "./FlowType.jsx";
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";

import { generateInitialElements } from "../parse-courses.js";

const API_URL = (
  import.meta.env.MODE === "production"
    ? import.meta.env.SNOWPACK_PUBLIC_PROD_API_URL
    : import.meta.env.SNOWPACK_PUBLIC_DEV_API_URL
);

// TODO: New department flow, new blank flow
export default function NewFlowDialog({
  modalCls, closeDialog, generateNewFlow
}) {
  const [busy, setBusy] = useState(false);
  const [warningAccepted, setWarningAccepted] = useState(0);
  const [slideState, setSlideState] = useState(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  function close() {
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setBusy(false);
        setSlideState(0);
      }, 100);
    } else {
      setBusy(false);
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

  const [supportedMajors, setSupportedMajors] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/degrees/`)
      .then(resp => resp.json())
      .then(data => setSupportedMajors(data))
      .catch(error => {
        console.error("Error:", error);
      });
    // TODO: Proper error handling
  }, []);

  const [supportedCurricula, setSupportedCurricula] = useState(new Map());
  useEffect(() => {
    fetch(`${API_URL}/curricula/`)
      .then(resp => resp.json())
      .then(data => {
        const curricula = new Map(Object.entries({
          Seattle: [],
          Bothell: [],
          Tacoma: [],
        }));
        for (const datum of data) {
          curricula.get(datum.campus).push(datum);
        }
        for (const campus of curricula.keys()) {
          curricula.get(campus).sort((a, b) => a.id.localeCompare(b.id));
          curricula.set(campus, curricula.get(campus).map(curr => (
            <option key={curr.id} value={curr.id}>
              {`${curr.id}: ${curr.name}`}
            </option>
          )));
        }
        setSupportedCurricula(curricula);
      })
      .catch(error => {
        console.error("Error:", error);
      });
    // TODO: Proper error handling
  }, []);

  function onCoursesFetched(fetchedData) {
    const newElements = generateInitialElements(fetchedData);
    generateNewFlow(newElements);
    close();
    // advanceSlide();
    // if (!prefersReducedMotion) {
    //   setTimeout(() => {
    //     setBusy(false);
    //   }, 250);
    // } else {
    //   setBusy(false);
    // }
  }

  const slideNum = warningAccepted + slideState;

  return (
    <DialogOverlay
      className={modalCls}
      isOpen={!modalCls.includes("--display-none")}
      onDismiss={event => {
        if (event.key === "Escape" && !busy) {
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
          <FlowType
            busy={busy}
            setBusy={setBusy}
            supportedMajors={supportedMajors}
            supportedCurricula={supportedCurricula}
            onCoursesFetched={onCoursesFetched}
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
  generateNewFlow: PropTypes.func.isRequired,
};
