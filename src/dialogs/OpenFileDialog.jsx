import React, { useState } from "react";
import PropTypes from "prop-types";

import { isEdge, isNode } from "react-flow-renderer";
import { DialogOverlay, DialogContent } from "@reach/dialog";

import Dropzone from "./Dropzone.jsx";
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";

const SUPPORTED_VERSIONS = ["Beta", "Beta.1"];
const DEPRECATED_VERSIONS = [];
export const [CURRENT_VERSION] = SUPPORTED_VERSIONS.slice(-1);

function betaToBeta1(elems) {
  // Change node type from "custom" to "course"
  // Remove selected field
  return elems.map(elem => (
    isNode(elem)
      ? { id: elem.id,
        type: "course",
        position: elem.position,
        data: elem.data,
      }
      : elem
  ));
}
const CONVERSION_FUNCS = [betaToBeta1];

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
      const loadedVersion = loadedData.version;
      const loadedElems = loadedData.elements;

      if (DEPRECATED_VERSIONS.includes(loadedVersion)) {
        setErrorMsg(`v${loadedVersion} data no longer supported`);
        setBusy(false);
        return;
      } else if (!SUPPORTED_VERSIONS.includes(loadedVersion)) {
        setErrorMsg("Invalid data version");
        setBusy(false);
        return;
      }

      const structureValid = (
        typeof loadedData === "object"
        && (
          Object.keys(loadedData).toString()
          === ["version", "elements"].toString()
        )
      );
      if (!structureValid) {
        setErrorMsg("Invalid data structure");
        setBusy(false);
        return;
      }

      const dataValid = (
        typeof loadedVersion === "string"
        && Array.isArray(loadedElems)
        && loadedElems.every(e => isNode(e) || isEdge(e))
      );
      if (!dataValid) {
        setErrorMsg("Invalid data");
        setBusy(false);
        return;
      }

      let convertedElems = loadedElems;
      if (loadedVersion !== CURRENT_VERSION) {
        const versionIndex = SUPPORTED_VERSIONS.indexOf(loadedVersion);
        for (const func of CONVERSION_FUNCS.slice(versionIndex)) {
          convertedElems = func(convertedElems);
        }
      }

      openFlow(convertedElems);
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
