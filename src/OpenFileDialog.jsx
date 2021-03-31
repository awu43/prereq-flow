import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import ModalDialog from "./ModalDialog.jsx";

export default function OpenFileDialog({ modalCls, closeDialog, openFlow }) {
  const [errorMsg, setErrorMsg] = useState("");
  const fileInput = useRef(null);

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
        <Tippy
          className="error-box"
          content={errorMsg}
          placement="bottom-start"
          arrow={false}
          duration={0}
          offset={[0, 5]}
          visible={errorMsg.length}
        >
          <input type="file" accept="application/json" ref={fileInput} />
        </Tippy>
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
