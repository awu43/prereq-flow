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
  ContextTarget,
} from "types/main";

import { COURSE_STATUS_CODES } from "../utils";

interface ContextMenuProps {
  active: boolean;
  data: ContextTarget;
  xy: XYPosition;
  setSelectionStatuses: (nodeIds: NodeId[], newStatus: CourseStatus) => void;
  toggleEdgeConcurrency: (edgeId: EdgeId) => void;
  deleteElems: (elemIds: ElementId[]) => void;
  connectAll: (targetId: NodeId) => void;
  disconnectAll: (targetIds: NodeId[]) => void;
  newConditionalNode: (type: ConditionalTypes, xy: XYPosition) => void;
  reroute: (targetId: NodeId) => void;
}
export default function ContextMenu({
  active,
  data,
  xy,
  setSelectionStatuses,
  toggleEdgeConcurrency,
  deleteElems,
  connectAll,
  disconnectAll,
  newConditionalNode,
  reroute,
}: ContextMenuProps) {
  const unsetNodesSelection = useStoreActions(actions => (
    actions.unsetNodesSelection
  ));

  const { target, targetType, targetStatus } = data;

  function deleteAndClearSelection(): void {
    unsetNodesSelection();
    deleteElems(target as ElementId[]);
  }

  if (!active) {
    return null;
  }

  let menuOptions;
  switch (targetType) {
    case "coursenode": {
      // Single course node
      const targetStatusCode = COURSE_STATUS_CODES[targetStatus];
      const courseStatusOptions = (
        <>
          <li
            key="planned"
            className={targetStatusCode >= 2 ? "current" : ""}
            onClick={() => setSelectionStatuses([target as NodeId], "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            className={targetStatus === "enrolled" ? "current" : ""}
            onClick={() => setSelectionStatuses([target as NodeId], "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            className={targetStatus === "completed" ? "current" : ""}
            onClick={() => setSelectionStatuses([target as NodeId], "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
        </>
      );
      menuOptions = (
        <>
          {targetStatusCode < 3 && courseStatusOptions}
          <li
            className="connect-all"
            onClick={() => connectAll(target as NodeId)}
          >
            <p>Connect&nbsp;all</p>
          </li>
          <li
            className="disconnect-all"
            onClick={() => disconnectAll([target as NodeId])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li
            className="delete"
            onClick={() => deleteElems([target as NodeId])}
          >
            <p>Delete</p>
          </li>
        </>
      );
      break;
    }
    case "conditionalnode":
      // Single conditional node
      menuOptions = (
        <>
          <li
            className="disconnect-all"
            onClick={() => disconnectAll([target as NodeId])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li className="reroute" onClick={() => reroute(target as NodeId)}>
            <p>Reroute</p>
          </li>
          <li
            className="delete"
            onClick={() => deleteElems([target as NodeId])}
          >
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "edge":
      // Single edge
      menuOptions = (
        <>
          <li
            key="concurrent"
            className={targetStatus === "CC" ? "current" : ""}
            onClick={() => toggleEdgeConcurrency(target as EdgeId)}
          >
            <p>Concurrent</p>
          </li>
          <hr />
          <li
            className="delete"
            onClick={() => deleteElems([target as EdgeId])}
          >
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "coursemultiselect":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          <li
            key="planned"
            onClick={() => setSelectionStatuses(target as NodeId[], "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            onClick={() => setSelectionStatuses(target as NodeId[], "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            onClick={() => setSelectionStatuses(target as NodeId[], "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
          <li
            className="disconnect-all"
            onClick={() => disconnectAll(target as NodeId[])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={() => deleteElems(target as NodeId[])}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "conditionalmultiselect":
      // At least one conditional node
      menuOptions = (
        <>
          <li
            className="disconnect-all"
            onClick={() => disconnectAll(target as NodeId[])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={() => deleteElems(target as NodeId[])}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "mixedmultiselect":
      // Multiple edges
      // At least one node and at least one edge
      menuOptions = (
        <>
          <li onClick={() => deleteElems(target as ElementId[])}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "courseselection":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          <li
            key="planned"
            onClick={() => setSelectionStatuses(target as NodeId[], "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            onClick={() => setSelectionStatuses(target as NodeId[], "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            onClick={() => setSelectionStatuses(target as NodeId[], "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
          <li
            className="disconnect-all"
            onClick={() => disconnectAll(target as NodeId[])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={deleteAndClearSelection}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "conditionalselection":
      // At least one conditional node
      menuOptions = (
        <>
          <li
            className="disconnect-all"
            onClick={() => disconnectAll(target as NodeId[])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={deleteAndClearSelection}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    case "pane":
      menuOptions = (
        <>
          <li onClick={() => newConditionalNode("or", xy)}>
            <p>New OR node</p>
          </li>
          <li onClick={() => newConditionalNode("and", xy)}>
            <p>New AND node</p>
          </li>
        </>
      );
      break;
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
