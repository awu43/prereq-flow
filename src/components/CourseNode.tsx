import React from "react";
import type { ReactElement } from "react";

import classNames from "classnames";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import { Handle, Position } from "react-flow-renderer";

import type { InnerText, CourseNodeData } from "types/main";

import usePrefersReducedMotion from "@usePrefersReducedMotion";
import { CRS } from "@utils";

function capitalizeFirstCharacter(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

export function splitByCourses(
  text: string,
  capitalizeFirst = false,
): InnerText {
  if (capitalizeFirst) {
    return capitalizeFirstCharacter(text)
      .replaceAll("/", "/\u200B")
      .split(new RegExp(`(${CRS})`));
  } else {
    return text.replaceAll("/", "/\u200B").split(new RegExp(`(${CRS})`));
  }
}

export function generateUwCourseElements(
  innerHTML: InnerText,
  elemFunc: (elemText: string, i: number) => ReactElement,
): void {
  for (let i = 1; i < innerHTML.length; i += 2) {
    innerHTML[i] = elemFunc(innerHTML[i] as string, i);
  }
}

function highlightUwCourses(text: string): InnerText {
  const innerHTML = splitByCourses(text, true);
  generateUwCourseElements(innerHTML, (elemText, i) => (
    <span key={i} className="uw-course-id uw-course-id--highlighted">
      {elemText}
    </span>
  ));
  return innerHTML;
}

const QUARTER_REGEX = {
  autumn: /\bA(?=W|Sp|S|\b)(?=[WSp]*\.\s*$)/,
  winter: /\bW(?=Sp|S|\b)(?=[Sp]*\.\s*$)/,
  spring: /\bSp(?=S|\b)(?=S?\.\s*$)/,
  summer: /\bS(?=\b\.\s*$)/,
};
export function markOfferedQuarters(innerHTML: InnerText): void {
  for (const [quarter, regex] of Object.entries<RegExp>(QUARTER_REGEX)) {
    const lastIndex = innerHTML.length - 1;
    const remainingText = innerHTML[lastIndex] as string;
    const match = remainingText.match(regex);
    if (match) {
      const [matchStr] = match;
      const remainingItems: InnerText = remainingText.split(regex);
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
}

interface CourseNodeProps {
  data: CourseNodeData;
}
export default function CourseNode({ data }: CourseNodeProps): JSX.Element {
  const prefersReducedMotion = usePrefersReducedMotion();

  const descriptionHTML = highlightUwCourses(data.description);
  const prereqHTML = highlightUwCourses(data.prerequisite);
  let offeredHTML = null;
  if (data.offered) {
    offeredHTML = splitByCourses(data.offered, true);
    generateUwCourseElements(offeredHTML, (elemText, i) => (
      <span key={i} className="uw-course-id">
        {elemText}
      </span>
    ));
    markOfferedQuarters(offeredHTML);
    offeredHTML = <p>Offered: {offeredHTML}</p>;
  }

  const tippyContent = (
    <>
      <p>
        {data.id} — {data.name} ({data.credits})
      </p>
      <p>{descriptionHTML}</p>
      <hr />
      <p>Prerequisite: {prereqHTML}</p>
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
        className={classNames("CourseNode", data.nodeStatus, {
          connected: data.nodeConnected,
        })}
      >
        <Handle type="target" position={Position.Left} />
        <div>{data.id}</div>
        <Handle type="source" position={Position.Right} />
      </div>
    </Tippy>
  );
}
