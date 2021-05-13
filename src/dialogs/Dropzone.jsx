/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { useDropzone } from "react-dropzone";
// https://react-dropzone.js.org/#section-styling-dropzone

export default function Dropzone({ busy, errorMsg, setErrorMsg, openFile }) {
  const [message, setMessage] = useState("Drop file or click to select");

  // Moved to CSS
  // const baseStyle = {
  //   flex: 1,
  //   display: "flex",
  //   flexDirection: "column",
  //   alignItems: "center",
  //   padding: "2rem 1rem",
  //   borderWidth: 2,
  //   borderRadius: 2,
  //   borderColor: "gray",
  //   borderStyle: "dashed",
  //   backgroundColor: "#fafafa",
  //   color: "black",
  //   outline: "none",
  //   transition: !prefersReducedMotion ? "border .24s ease-in-out" : "none",
  // };
  // const activeStyle = {
  //   borderColor: "#2196f3"
  // };

  const {
    getRootProps,
    getInputProps,
    // isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    accept: "application/json",
    disabled: busy,
    multiple: false,
    onDropAccepted: files => {
      setMessage("Opening...");
      setErrorMsg("");
      openFile(files);
    },
    onDropRejected: fileRejections => {
      if (fileRejections.length > 1) {
        setErrorMsg("Only one file allowed");
      } else {
        setErrorMsg("Invalid file type");
      }
    },
  });

  const style = useMemo(() => {
    const acceptStyle = {
      borderColor: "lime"
    };
    const rejectStyle = {
      borderColor: "red"
    };
    return {
      // ...baseStyle,
      // ...(isDragActive ? activeStyle : {}), // Not sure what this does
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    };
  }, [isDragReject, isDragAccept]);

  return (
    <div className={classNames("Dropzone", { "Dropzone--disabled": busy })}>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p className={errorMsg.length ? "error" : ""}>
          {errorMsg.length ? errorMsg : message}
        </p>
      </div>
    </div>
  );
}

Dropzone.propTypes = {
  busy: PropTypes.bool.isRequired,
  errorMsg: PropTypes.string.isRequired,
  setErrorMsg: PropTypes.func.isRequired,
  openFile: PropTypes.func.isRequired,
};
