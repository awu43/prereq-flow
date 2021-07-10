import React from "react";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { Handle, Position } from "react-flow-renderer";

import type { CourseNodeData } from "types/main";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import { COURSE_REGEX } from "@utils";

function markCoursesAndPreventBreaks(text: string): string {
  let innerHTML = text.replaceAll(
    COURSE_REGEX, "<span class=\"uw-course-id\">$&</span>"
  );
  innerHTML = innerHTML.replace(/\/(?!span)/g, "/\u200B");
  return innerHTML;
}

function markOfferedQuarters(text: string): string {
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
  innerHTML = innerHTML.replace(/\/(?!span)/g, "/\u200B");
  innerHTML = innerHTML.replaceAll(
    COURSE_REGEX, "<span class=\"offered-jointly\">$&</span>"
  );
  return innerHTML;
}

export default function CourseNode({ data }: { data: CourseNodeData }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const prereqHTML = markCoursesAndPreventBreaks(data.prerequisite);
  const offeredHTML = (
    data.offered
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
      className="tippy-box--flow"
      content={tippyContent}
      duration={prefersReducedMotion ? 0 : 100}
      maxWidth="15rem"
      hideOnClick={true}
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
        <Handle type="target" position={Position.Left} />
        <div>{data.id}</div>
        <Handle type="source" position={Position.Right} />
      </div>
    </Tippy>
  );
}
