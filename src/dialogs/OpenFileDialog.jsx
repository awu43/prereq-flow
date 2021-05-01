import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";

import { DialogOverlay, DialogContent } from "@reach/dialog";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

export default function OpenFileDialog({ modalCls, closeDialog, openFlow }) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  function close() {
    setBusy(false);
    setErrorMsg("");
    closeDialog();
  }

  function validateFile(file) {
    setBusy(true);

    if (file.type !== "application/json") {
      setErrorMsg("Invalid file type");
      setBusy(false);
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
        setBusy(false);
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
        setBusy(false);
        // eslint-disable-next-line no-useless-return
        return;
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
        <button
          type="button"
          className="close-button"
          onClick={close}
          disabled={busy}
        >
          <img src="dist/icons/x-black.svg" alt="close" />
        </button>
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
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              disabled={busy}
            />
          </Tippy>
          <button
            className="OpenFileDialog__open-button"
            type="button"
            onClick={openFile}
            disabled={busy}
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
