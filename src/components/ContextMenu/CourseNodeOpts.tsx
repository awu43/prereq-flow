import React from "react";

import type { CourseStatus, CourseNode } from "types/main";
import type { OptListProps } from "types/ContextMenu";

import {
  isCourseNode,
  courseIdMatch,
  edgeArrowId,
  COURSE_STATUS_CODES,
} from "@utils";

const COURSE_REGEX = /^(?:[A-Z&]+ )+\d{3}$/;

export default function CourseNodeOpts({
  contextProps,
  sharedOpts,
}: OptListProps): JSX.Element {
  const {
    elements,
    nodeData,
    elemIndexes,
    data,
    setSelectionStatuses,
    editCourseData,
  } = contextProps;
  const {
    connectPrereqsOpt,
    connectPostreqsOpt,
    connectAllOpt,

    disconnectPrereqsOpt,
    disconnectPostreqsOpt,
    disconnectAllOpt,

    deleteElemsOpt,
  } = sharedOpts;

  const { target, targetStatus } = data;

  const targetNode = target[0];
  const targetStatusCode = COURSE_STATUS_CODES[targetStatus as CourseStatus];
  const courseStatusOptions = (
    <>
      <li
        key="planned"
        className={targetStatusCode >= 2 ? "current" : ""}
        onClick={() => setSelectionStatuses(target, "ready")}
      >
        <p>Planned</p>
      </li>
      <li
        key="enrolled"
        className={targetStatus === "enrolled" ? "current" : ""}
        onClick={() => setSelectionStatuses(target, "enrolled")}
      >
        <p>Enrolled</p>
      </li>
      <li
        key="complete"
        className={targetStatus === "completed" ? "current" : ""}
        onClick={() => setSelectionStatuses(target, "completed")}
      >
        <p>Completed</p>
      </li>
      <hr />
    </>
  );
  const allPrereqs = courseIdMatch(
    (elements[elemIndexes.get(targetNode)] as CourseNode).data.prerequisite,
  );
  const allPrereqsConnected = allPrereqs
    ? allPrereqs.every(
        p => !elemIndexes.has(p) || elemIndexes.has(edgeArrowId(p, targetNode)),
      )
    : true;
  const notConnectedPostreqs: CourseNode[] = [];
  const numNodes = nodeData.size;
  for (let i = 0; i < numNodes; i++) {
    const postreq = elements[i];
    if (
      isCourseNode(postreq) &&
      postreq.data.prerequisite.includes(targetNode) &&
      !elemIndexes.has(edgeArrowId(targetNode, postreq.id))
    ) {
      notConnectedPostreqs.push(postreq);
    }
  }
  const hasPrereqs = !!nodeData.get(targetNode).incomingEdges.length;
  const hasPostreqs = !!nodeData.get(targetNode).outgoingEdges.length;

  return (
    <>
      {targetStatusCode < 3 && courseStatusOptions}
      {!allPrereqsConnected && connectPrereqsOpt}
      {!!notConnectedPostreqs.length && connectPostreqsOpt}
      {!allPrereqsConnected && !!notConnectedPostreqs.length && connectAllOpt}
      {hasPrereqs && disconnectPrereqsOpt}
      {hasPostreqs && disconnectPostreqsOpt}
      {hasPrereqs && hasPostreqs && disconnectAllOpt}
      <li onClick={() => editCourseData(targetNode)}>
        <p>Edit data</p>
      </li>
      {deleteElemsOpt}
      {COURSE_REGEX.test(targetNode) ? (
        <>
          <hr />
          <li>
            <p>
              <a
                href={`https://myplan.uw.edu/course/#/courses/${targetNode}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in MyPlan
              </a>
            </p>
          </li>
        </>
      ) : null}
    </>
  );
}
