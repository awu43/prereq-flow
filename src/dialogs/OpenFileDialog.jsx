import React, { useState } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";
import { DialogOverlay, DialogContent } from "@reach/dialog";

import Dropzone from "./Dropzone.jsx";
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";

export default function OpenFileDialog({ modalCls, closeDialog, openFlow }) {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const prefersReducedMotion = usePrefersReducedMotion();
  function close() {
    closeDialog();
    if (!prefersReducedMotion) {
      setTimeout(() => {
        setBusy(false);
        setErrorMsg("");
      }, 100);
    } else {
      setBusy(false);
      setErrorMsg("");
    }
  }

  // TODO: Convert old versions
  function openFile(files) {
    const [file] = files;

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

      const structureValid = (
        typeof loadedData === "object"
        && (
          Object.keys(loadedData).toString()
          === ["version", "elements"].toString()
        )
      );
      if (!structureValid) {
        setErrorMsg("Invalid data");
        setBusy(false);
        return;
      }

      const { version, elements } = loadedData;
      const dataValid = (
        typeof version === "string"
        && Array.isArray(elements)
        && elements.every(e => isNode(e) || isEdge(e))
      );
      if (!dataValid) {
        setErrorMsg("Invalid data");
        setBusy(false);
        return;
      }

      openFlow(elements);
      close();
    };
  }

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
          <h2>Open flow</h2>
          <Dropzone
            busy={busy}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
            openFile={openFile}
          />
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
