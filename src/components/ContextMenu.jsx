/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes from "prop-types";

import { useStoreActions } from "react-flow-renderer";

import "./ContextMenu.scss";

import { COURSE_STATUS_CODES } from "../utils.js";

export default function ContextMenu({
  active, data, xy,
  setSelectionStatuses, deleteElems,
  connectAll, disconnectAll, toggleEdgeConcurrency,
  newConditionalNode, reroute,
}) {
  const unsetNodesSelection = useStoreActions(actions => (
    actions.unsetNodesSelection
  ));

  const { target, targetType, targetStatus } = data;

  function deleteAndClearSelection() {
    unsetNodesSelection();
    deleteElems(target);
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
            onClick={() => setSelectionStatuses([target], "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            className={targetStatus === "enrolled" ? "current" : ""}
            onClick={() => setSelectionStatuses([target], "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            className={targetStatus === "completed" ? "current" : ""}
            onClick={() => setSelectionStatuses([target], "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
        </>
      );
      menuOptions = (
        <>
          {targetStatusCode < 3 && courseStatusOptions}
          <li className="connect-all" onClick={() => connectAll(target)}>
            <p>Connect&nbsp;all</p>
          </li>
          <li
            className="disconnect-all"
            onClick={() => disconnectAll([target])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li className="delete" onClick={() => deleteElems([target])}>
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
            onClick={() => disconnectAll([target])}
          >
            <p>Disconnect&nbsp;all</p>
          </li>
          <li className="reroute" onClick={() => reroute(target)}>
            <p>Reroute</p>
          </li>
          <li className="delete" onClick={() => deleteElems([target])}>
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
            onClick={() => toggleEdgeConcurrency(target)}
          >
            <p>Concurrent</p>
          </li>
          <hr />
          <li className="delete" onClick={() => deleteElems([target])}>
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
            onClick={() => setSelectionStatuses(target, "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            onClick={() => setSelectionStatuses(target, "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            onClick={() => setSelectionStatuses(target, "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
          <li className="disconnect-all" onClick={() => disconnectAll(target)}>
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={() => deleteElems(target)}><p>Delete</p></li>
        </>
      );
      break;
    case "conditionalmultiselect":
      // At least one conditional node
      menuOptions = (
        <>
          <li className="disconnect-all" onClick={() => disconnectAll(target)}>
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={() => deleteElems(target)}><p>Delete</p></li>
        </>
      );
      break;
    case "mixedmultiselect":
      // Multiple edges
      // At least one node and at least one edge
      menuOptions = (
        <>
          <li onClick={() => deleteElems(target)}>
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
            onClick={() => setSelectionStatuses(target, "ready")}
          >
            <p>Planned</p>
          </li>
          <li
            key="enrolled"
            onClick={() => setSelectionStatuses(target, "enrolled")}
          >
            <p>Enrolled</p>
          </li>
          <li
            key="complete"
            onClick={() => setSelectionStatuses(target, "completed")}
          >
            <p>Completed</p>
          </li>
          <hr />
          <li className="disconnect-all" onClick={() => disconnectAll(target)}>
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={deleteAndClearSelection}><p>Delete</p></li>
        </>
      );
      break;
    case "conditionalselection":
      // At least one conditional node
      menuOptions = (
        <>
          <li className="disconnect-all" onClick={() => disconnectAll(target)}>
            <p>Disconnect&nbsp;all</p>
          </li>
          <li onClick={deleteAndClearSelection}><p>Delete</p></li>
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

ContextMenu.propTypes = {
  active: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    target: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    targetType: PropTypes.string,
    targetStatus: PropTypes.string,
  }).isRequired,
  xy: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }).isRequired,
  setSelectionStatuses: PropTypes.func.isRequired,
  deleteElems: PropTypes.func.isRequired,
  connectAll: PropTypes.func.isRequired,
  disconnectAll: PropTypes.func.isRequired,
  toggleEdgeConcurrency: PropTypes.func.isRequired,
  newConditionalNode: PropTypes.func.isRequired,
  reroute: PropTypes.func.isRequired,
};
