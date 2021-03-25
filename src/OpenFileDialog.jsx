import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";

import ModalDialog from "./ModalDialog.jsx";

export default function OpenFileDialog({ modalCls, closeDialog, openFlow }) {
  const [errorMsg, setErrorMsg] = useState("");
  const fileInput = useRef(null);

  function close() {
    closeDialog();
    setTimeout(() => {
      setErrorMsg("");
    }, 100);
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
      if (typeof loadedData !== "object"
          || Object.keys(loadedData).length !== 2
          || !("elements" in loadedData)
          || !("nodeData" in loadedData)) {
        setErrorMsg("Invalid data");
        return;
      }
      const { elements, nodeData } = loadedData;
      const dataValid = (
        Array.isArray(elements)
        && elements.every(e => isNode(e) || isEdge(e))
        && typeof nodeData === "object"
        && elements.filter(e => isNode(e)).length
            === Object.keys(nodeData).length
      );
      if (!dataValid) {
        setErrorMsg("Invalid data");
      } else {
        openFlow(elements, new Map(Object.entries(nodeData)));
        close();
      }
    };
  }

  function openFile() {
    const file = fileInput.current.files[0];
    if (file !== undefined) {
      validateFile(file);
    }
  }

  return (
    <ModalDialog modalCls={modalCls} dlgCls="OpenFileDialog">
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button type="button" className="close-button" onClick={close}></button>
      <section>
        <h2>Open flow</h2>
        <input type="file" accept="application/json" ref={fileInput} />
        <p>{errorMsg}</p>
        <button className="open-file" type="button" onClick={openFile}>
          Open
        </button>
      </section>
    </ModalDialog>
  );
}
OpenFileDialog.propTypes = {
  modalCls: PropTypes.string.isRequired,
  closeDialog: PropTypes.func.isRequired,
  openFlow: PropTypes.func.isRequired,
};
