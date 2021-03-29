import React from "react";
import PropTypes from "prop-types";
import Tippy from "@tippyjs/react";

import { Handle } from "react-flow-renderer";

// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { COURSE_REGEX } from "./data/parse-courses.js";

const defaultNodeStyle = {
  padding: "10px",
  // "border-radius": "3px",
  width: "150px",
  // "fontSize": "12px",
  // color: "#222",
  textAlign: "center",
  // "border-width": "1px",
  borderStyle: "solid",
};

export default function CustomNode({ data }) {
  const prereqText = data.prerequisite.replaceAll(
    COURSE_REGEX, "<mark>$&</mark>"
  );

  const tippyContent = (
    <>
      <p>{data.id} — {data.name} ({data.credits})</p>
      <p>{data.description}</p>
      <hr />
      {/* eslint-disable-next-line react/no-danger */}
      <p dangerouslySetInnerHTML={{ __html: `Prerequisite: ${prereqText}` }}></p>
      {data.offered.length ? <p>Offered: {data.offered}</p> : null}
    </>
  );

  return (
    <Tippy
      content={tippyContent}
      duration={100}
      hideOnClick={true}
      maxWidth="15rem"
      trigger="mouseenter"
      // For testing
      // hideOnClick={false}
      // trigger="click"
    >
      <div
        className={`CustomNode ${data.nodeStatus}${
          data.nodeConnected ? " connected" : ""}`}
        style={defaultNodeStyle}
      >
        <Handle type="target" position="left" />
        <div>{data.id}</div>
        <Handle type="source" position="right" />
      </div>
    </Tippy>
  );
}
CustomNode.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    credits: PropTypes.string,
    description: PropTypes.string,
    prerequisite: PropTypes.string,
    offered: PropTypes.string,
    nodeStatus: PropTypes.string,
    nodeConnected: PropTypes.bool,
  }).isRequired,
};
