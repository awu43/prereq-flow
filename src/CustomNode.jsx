import React from "react";
import PropTypes from "prop-types";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { Handle } from "react-flow-renderer";

// Not sure how to pass this from App into CustomNode
import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";

import { COURSE_REGEX } from "./parse-courses.js";

const defaultNodeStyle = {
  padding: "10px",
  // "border-radius": "3px",
  minWidth: "150px",
  // "fontSize": "12px",
  // color: "#222",
  textAlign: "center",
  // "border-width": "1px",
  borderStyle: "solid",
};

function markCoursesAndPreventBreaks(text) {
  let newText = text.replaceAll(COURSE_REGEX, "<mark>$&</mark>");
  try {
    for (const match of text.match(COURSE_REGEX)) {
      newText = newText.replace(match, match.replaceAll(" ", "\u00A0"));
      // Stop courses from being split
    }
  } catch (err) {
    // null = no matches
    if (!(err instanceof TypeError)) {
      throw err;
    }
  }
  newText = newText.replace(/ ([\S\u00A0.]+)$/, "\u00A0$1"); // Stop orphans
  return newText;
}

export default function CustomNode({ data }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const prereqText = markCoursesAndPreventBreaks(data.prerequisite);

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
      duration={prefersReducedMotion ? 0 : 100}
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
