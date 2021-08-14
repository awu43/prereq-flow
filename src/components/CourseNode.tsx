import React from "react";
import type { ReactElement } from "react";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { Handle, Position } from "react-flow-renderer";

import type { CourseNodeData } from "types/main";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import { CRS } from "@utils";

function splitByCourses(text: string): (string | ReactElement)[] {
  return text.replaceAll("/", "/\u200B").split(new RegExp(`(${CRS})`));
}

function markCoursesAndPreventBreaks(text: string): (string | ReactElement)[] {
  const innerHTML = splitByCourses(
    `${text.charAt(0).toUpperCase()}${text.slice(1)}`
  );
  for (let i = 1; i < innerHTML.length; i += 2) {
    innerHTML[i] = (
      <span key={i} className="uw-course-id uw-course-id--highlighted">
        {innerHTML[i]}
      </span>
    );
  }
  return innerHTML;
}

const QUARTER_REGEX = {
  autumn: /\bA(?=W|Sp|S|\b)(?=[WSp]*\.\s*$)/,
  winter: /(?<=A|\b)W(?=Sp|S|\b)(?=[Sp]*\.\s*$)/,
  spring: /(?<=A|W|\b)Sp(?=S|\b)(?=S?\.\s*$)/,
  summer: /(?<=A|W|Sp|\b)S(?=\b\.\s*$)/,
};
function markOfferedQuarters(text: string): (string | ReactElement)[] {
  const innerHTML: (string | ReactElement)[] = splitByCourses(text);
  for (let i = 1; i < innerHTML.length; i += 2) {
    innerHTML[i] = (
      <span key={i} className="uw-course-id">
        {innerHTML[i]}
      </span>
    );
  }
  for (const [quarter, regex] of Object.entries<RegExp>(QUARTER_REGEX)) {
    const lastIndex = innerHTML.length - 1;
    const remainingText = innerHTML[lastIndex] as string;
    const match = remainingText.match(regex);
    if (match) {
      const [matchStr] = match;
      const remainingItems: (string | ReactElement)[] = (
        remainingText.split(regex)
      );
      remainingItems.splice(
        1,
        0,
        <span key={quarter} className={`offered-${quarter}`}>
          {matchStr}
        </span>,
      );
      innerHTML.splice(lastIndex, 1, ...remainingItems);
    }
  }
  return innerHTML;
}

// TODO: Memoize
export default function CourseNode({ data }: { data: CourseNodeData }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const prereqHTML = markCoursesAndPreventBreaks(data.prerequisite);
  const offeredHTML = (
    data.offered
      ? <p>Offered: {markOfferedQuarters(data.offered)}</p>
      : null
  );

  const tippyContent = (
    <>
      <p>{data.id} — {data.name} ({data.credits})</p>
      <p>{data.description}</p>
      <hr />
      <p>{prereqHTML}</p>
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
