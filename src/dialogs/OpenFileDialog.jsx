import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

export default function OpenFileDialog({ modalCls, closeDialog, openFlow }) {
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  function close() {
    setErrorMsg("");
    closeDialog();
  }

  function validateFile(file) {
    if (file.type !== "application/json") {
      setErrorMsg("Invalid file type");
      return;
    }
    const reader = new FileReader();
    reader.readAsText(file);

    let loadedData;
    reader.onload = event => {
      loadedData = JSON.parse(event.target.result);
      const structureValid = [
        typeof loadedData === "object",
        Object.keys(loadedData).toString() === ["version", "elements"].toString()
      ].every(a => a);
      if (!structureValid) {
        setErrorMsg("Invalid data");
        return;
      }
      const { version, elements } = loadedData;
      const dataValid = [
        typeof version === "string",
        Array.isArray(elements),
        elements.every(e => isNode(e) || isEdge(e)),
      ].every(a => a);
      if (!dataValid) {
        setErrorMsg("Invalid data");
      } else {
        openFlow(elements);
        close();
      }
    };
  }

  function openFile() {
    const file = fileInputRef.current.files[0];
    if (file !== undefined) {
      validateFile(file);
    }
  }

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
      <DialogContent className="OpenFileDialog" aria-label="Open file dialog">
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <button type="button" className="close-button" onClick={close}></button>
        <section>
          {/* TODO: Drag+drop file input */}
          <h2>Open flow</h2>
          <Tippy
            className="tippy-box--error"
            content={errorMsg}
            placement="bottom-start"
            arrow={false}
            duration={0}
            offset={[0, 5]}
            visible={errorMsg.length}
          >
            <input type="file" accept="application/json" ref={fileInputRef} />
          </Tippy>
          <button
            className="OpenFileDialog__open-button"
            type="button"
            onClick={openFile}
          >
            Open
          </button>
        </section>
      </DialogContent>
    </DialogOverlay>
  );
}
OpenFileDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  openFlow: PropTypes.func.isRequired,
};
