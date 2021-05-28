import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { Handle } from "react-flow-renderer";

// Not sure how to pass this from App into CustomNode
import usePrefersReducedMotion from "../usePrefersReducedMotion.jsx";

import { COURSE_REGEX } from "../utils.js";

function markCoursesAndPreventBreaks(text) {
  let innerHTML = text.replaceAll(COURSE_REGEX, "<mark>$&</mark>");
  try {
    for (const match of text.match(COURSE_REGEX)) {
      innerHTML = innerHTML.replace(match, match.replaceAll(" ", "\u00A0"));
      // Stop courses from being split
    }
  } catch (err) {
    // null = no matches
    if (!(err instanceof TypeError)) {
      throw err;
    }
  }
  innerHTML = innerHTML.replace(/ ([\S\u00A0.]+)$/, "\u00A0$1"); // Stop orphans
  return innerHTML;
}

function markOfferedQuarters(text) {
  let innerHTML = text.replace(
    /A(?=W|Sp|S|\b)(?=[WSp]*\.\s*$)/,
    "<span class=\"offered-autumn\">$&</span>"
  );
  innerHTML = innerHTML.replace(
    /(?<=A|\b)W(?=Sp|S|\b)(?=[Sp]*\.\s*$)/,
    "<span class=\"offered-winter\">$&</span>"
  );
  innerHTML = innerHTML.replace(
    /(?<=A|W|\b)Sp(?=S|\b)(?=S?\.\s*$)/,
    "<span class=\"offered-spring\">$&</span>"
  );
  innerHTML = innerHTML.replace(
    /(?<=A|W|Sp|\b)S(?=\b\.\s*$)/,
    "<span class=\"offered-summer\">$&</span>"
  );
  return innerHTML;
}

export default function CourseNode({ data }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const prereqHTML = markCoursesAndPreventBreaks(data.prerequisite);
  const offeredHTML = (
    data.offered.length
      ? (
        <p
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `Offered: ${markOfferedQuarters(data.offered)}`
          }}
        />
      )
      : null
  );

  const tippyContent = (
    <>
      <p>{data.id} — {data.name} ({data.credits})</p>
      <p>{data.description}</p>
      <hr />
      <p
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: `Prerequisite: ${prereqHTML}` }}
      />
      {offeredHTML}
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
        className={classNames(
          "CourseNode", data.nodeStatus, { connected: data.nodeConnected }
        )}
      >
        <Handle type="target" position="left" />
        <div>{data.id}</div>
        <Handle type="source" position="right" />
      </div>
    </Tippy>
  );
}
CourseNode.propTypes = {
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
