/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";

import { useStoreActions } from "react-flow-renderer";

import "./ContextMenu.scss";

import type {
  CourseStatus,
  XYPosition,
  NodeId,
  EdgeId,
  ElementId,
  ConditionalTypes,
  Node,
  CourseNode,
  Element,
  NodeDataMap,
  ElemIndexMap,
  ConnectTo,
  ContextTarget,
} from "types/main";

import {
  isCourseNode,
  courseIdMatch,
  edgeArrowId,
  COURSE_STATUS_CODES,
} from "../utils";

interface ContextMenuProps {
  elements: Element[];
  nodeData: NodeDataMap;
  elemIndexes: ElemIndexMap;
  active: boolean;
  data: ContextTarget;
  xy: XYPosition;
  setSelectionStatuses: (nodeIds: NodeId[], newStatus: CourseStatus) => void;
  toggleEdgeConcurrency: (edgeId: EdgeId) => void;
  deleteElems: (elemIds: ElementId[]) => void;
  connect: (targetId: NodeId, to?: ConnectTo) => void;
  disconnect: (targetIds: NodeId[], from?: ConnectTo) => void;
  newConditionalNode: (type: ConditionalTypes, xy: XYPosition) => void;
  rerouteSingle: (targetId: NodeId) => void;
  reroutePointless: () => void;
}
export default function ContextMenu({
  elements,
  nodeData,
  elemIndexes,
  active,
  data,
  xy,
  setSelectionStatuses,
  toggleEdgeConcurrency,
  deleteElems,
  connect,
  disconnect,
  newConditionalNode,
  rerouteSingle,
  reroutePointless,
}: ContextMenuProps) {
  const unsetNodesSelection = useStoreActions(actions => (
    actions.unsetNodesSelection
  ));

  const { target, targetType, targetStatus } = data;

  function deleteAndClearSelection(): void {
    unsetNodesSelection();
    deleteElems(target);
  }

  if (!active) {
    return null;
  }

  function setSelectionStatusOpt(
    status: CourseStatus,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => setSelectionStatuses(target, status)}>
        <p>{label}</p>
      </li>
    );
  }
  const setReadyOpt = setSelectionStatusOpt("ready", "Planned");
  const setEnrolledOpt = setSelectionStatusOpt("enrolled", "Enrolled");
  const setCompletedOpt = setSelectionStatusOpt("completed", "Completed");

  function connectOpt(
    prereq: boolean,
    postreq: boolean,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => connect(target[0], { prereq, postreq })}>
        <p>{label}</p>
      </li>
    );
  }
  const connectPrereqsOpt = connectOpt(true, false, "Connect\u00A0prereqs");
  const connectPostreqsOpt = connectOpt(false, true, "Connect\u00A0postreqs");
  const connectAllOpt = connectOpt(true, true, "Connect\u00A0all");

  function disconnectOpt(
    prereq: boolean,
    postreq: boolean,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => disconnect(target, { prereq, postreq })}>
        <p>{label}</p>
      </li>
    );
  }
  const disconnectPrereqsOpt = disconnectOpt(
    true, false, "Disconnect\u00A0prereqs"
  );
  const disconnectPostreqsOpt = disconnectOpt(
    false, true, "Disconnect\u00A0postreqs"
  );
  const disconnectAllOpt = disconnectOpt(true, true, "Disconnect\u00A0all");

  const deleteElemsOpt = (
    <li onClick={() => deleteElems(target)}>
      <p>Delete</p>
    </li>
  );
  const deleteAndClearOpt = (
    <li onClick={deleteAndClearSelection}>
      <p>Delete</p>
    </li>
  );

  let menuOptions;
  switch (targetType) {
    case "coursenode": {
      // Single course node
      const targetNode = target[0];
      const targetStatusCode = COURSE_STATUS_CODES[targetStatus];
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
        (elements[elemIndexes.get(targetNode)] as CourseNode).data.prerequisite
      );
      const allPrereqsConnected = (
        allPrereqs
          ? allPrereqs.every(p => (
            !elemIndexes.has(p) || elemIndexes.has(edgeArrowId(p, targetNode))
          ))
          : true
      );
      const notConnectedPostreqs = [] as CourseNode[];
      const numNodes = nodeData.size;
      for (let i = 0; i < numNodes; i++) {
        const postreq = elements[i];
        if (isCourseNode(postreq)
            && postreq.data.prerequisite.includes(targetNode)
            && !elemIndexes.has(edgeArrowId(targetNode, postreq.id))) {
          notConnectedPostreqs.push(postreq);
        }
      }
      const hasPrereqs = !!nodeData.get(targetNode).incomingEdges.length;
      const hasPostreqs = !!nodeData.get(targetNode).outgoingEdges.length;
      menuOptions = (
        <>
          {targetStatusCode < 3 && courseStatusOptions}
          {!allPrereqsConnected && connectPrereqsOpt}
          {!!notConnectedPostreqs.length && connectPostreqsOpt}
          {(
            !allPrereqsConnected
            && !!notConnectedPostreqs.length
            && connectAllOpt
          )}
          {hasPrereqs && disconnectPrereqsOpt}
          {hasPostreqs && disconnectPostreqsOpt}
          {hasPrereqs && hasPostreqs && disconnectAllOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    }
    case "conditionalnode": {
      // Single conditional node
      const hasPrereqs = !!nodeData.get(target[0]).incomingEdges.length;
      const hasPostreqs = !!nodeData.get(target[0]).outgoingEdges.length;
      let pointlessOrNodeFound = false;
      const numNodes = nodeData.size;
      for (let i = 0; i < numNodes; i++) {
        const elem = elements[i];
        if (
          (elem as Node).type === "or"
          && nodeData.get(elem.id).incomingEdges.length === 1
        ) {
          pointlessOrNodeFound = true;
          break;
        }
      }
      const reroutePointlessOpt = (
        <li onClick={reroutePointless}>
          <p>Reroute pointless OR nodes</p>
        </li>
      );
      menuOptions = (
        <>
          {hasPrereqs && disconnectPrereqsOpt}
          {hasPostreqs && disconnectPostreqsOpt}
          {hasPrereqs && hasPostreqs && disconnectAllOpt}
          <li className="reroute" onClick={() => rerouteSingle(target[0])}>
            <p>Reroute</p>
          </li>
          {pointlessOrNodeFound && reroutePointlessOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    }
    case "edge":
      // Single edge
      menuOptions = (
        <>
          <li
            key="concurrent"
            className={targetStatus === "CC" ? "current" : ""}
            onClick={() => toggleEdgeConcurrency(target[0])}
          >
            <p>Concurrent</p>
          </li>
          <hr />
          {deleteElemsOpt}
        </>
      );
      break;
    case "coursemultiselect":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          {setReadyOpt}
          {setEnrolledOpt}
          {setCompletedOpt}
          <hr />
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    case "conditionalmultiselect":
      // At least one conditional node
      menuOptions = (
        <>
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    case "mixedmultiselect":
      // Multiple edges
      // At least one node and at least one edge
      menuOptions = (
        <>
          {deleteElemsOpt}
        </>
      );
      break;
    case "courseselection":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          {setReadyOpt}
          {setEnrolledOpt}
          {setCompletedOpt}
          <hr />
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteAndClearOpt}
        </>
      );
      break;
    case "conditionalselection":
      // At least one conditional node
      menuOptions = (
        <>
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteAndClearOpt}
        </>
      );
      break;
    case "pane": {
      let pointlessOrNodeFound = false;
      const numNodes = nodeData.size;
      for (let i = 0; i < numNodes; i++) {
        const elem = elements[i];
        if (
          (elem as Node).type === "or"
          && nodeData.get(elem.id).incomingEdges.length === 1
        ) {
          pointlessOrNodeFound = true;
          break;
        }
      }
      const reroutePointlessOpt = (
        <li onClick={reroutePointless}>
          <p>Reroute pointless OR nodes</p>
        </li>
      );
      menuOptions = (
        <>
          <li onClick={() => newConditionalNode("or", xy)}>
            <p>New OR node</p>
          </li>
          <li onClick={() => newConditionalNode("and", xy)}>
            <p>New AND node</p>
          </li>
          {pointlessOrNodeFound && reroutePointlessOpt}
        </>
      );
      break;
    }
    default:
      // eslint-disable-next-line no-console
      console.error("Invalid context target");
      return null;
  }

  return (
    <ul className="ContextMenu" style={{ top: xy.y, left: xy.x }}>
      {menuOptions}
    </ul>
  );
}
