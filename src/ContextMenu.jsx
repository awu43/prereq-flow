/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes from "prop-types";

import { useStoreActions } from "react-flow-renderer";

export default function ContextMenu({
  active, data, xy, COURSE_STATUS_CODES,
  setSelectionStatuses, deleteElems,
  connectAll, disconnectAll, toggleEdgeConcurrency,
  newOrNode,
}) {
  const setUserSelection = useStoreActions(actions => (
    actions.setUserSelection
  ));

  const { target, targetType, targetStatus } = data;

  function deleteAndClearSelection() {
    setUserSelection([]);
    deleteElems(target);
  }

  if (!active) {
    return null;
  }

  let menuOptions;
  switch (targetType) {
    case "node": {
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
          <li className="disconnect-all" onClick={() => disconnectAll(target)}>
            <p>Disconnect&nbsp;all</p>
          </li>
          <li className="delete" onClick={() => deleteElems([target])}>
            <p>Delete</p>
          </li>
        </>
      );
      break;
    }
    case "edge":
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
    // TODO: Update for or nodes
    case "nodeselection":
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
          <li onClick={() => deleteElems(target)}><p>Delete</p></li>
        </>
      );
      break;
    case "mixedselection":
      menuOptions = (
        <li onClick={() => deleteElems(target)}><p>Delete</p></li>
      );
      break;
    case "selection":
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
          <li onClick={deleteAndClearSelection}><p>Delete</p></li>
        </>
      );
      break;
    case "pane":
      menuOptions = (
        <>
          <li onClick={() => newOrNode({ x: xy[0], y: xy[1] })}>
            <p>New OR node</p>
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
    <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
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
  xy: PropTypes.arrayOf(PropTypes.number).isRequired,
  COURSE_STATUS_CODES: PropTypes.objectOf(PropTypes.number).isRequired,
  setSelectionStatuses: PropTypes.func.isRequired,
  deleteElems: PropTypes.func.isRequired,
  connectAll: PropTypes.func.isRequired,
  disconnectAll: PropTypes.func.isRequired,
  toggleEdgeConcurrency: PropTypes.func.isRequired,
  newOrNode: PropTypes.func.isRequired,
};
