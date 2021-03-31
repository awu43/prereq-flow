/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes from "prop-types";

import { useStoreActions } from "react-flow-renderer";

export default function ContextMenu({
  active, data, xy, COURSE_STATUS_CODES,
  setSelectionStatuses, toggleEdgeConcurrency, deleteElems
}) {
  const setUserSelection = useStoreActions(actions => (
    actions.setUserSelection
  ));

  const { target, targetType, targetStatus } = data;

  function deleteAndClearSelection() {
    setUserSelection([]);
    deleteElems(target);
  }

  if (active) {
    if (targetType === "selection") {
      const nodeOptions = [
        <li
          key="planned"
          onClick={() => setSelectionStatuses(target, "ready")}
        >
          <p>Planned</p>
        </li>,
        <li
          key="enrolled"
          onClick={() => setSelectionStatuses(target, "enrolled")}
        >
          <p>Enrolled</p>
        </li>,
        <li
          key="complete"
          onClick={() => setSelectionStatuses(target, "completed")}
        >
          <p>Completed</p>
        </li>,
      ];

      return (
        <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
          {nodeOptions}
          <hr />
          <li onClick={deleteAndClearSelection}><p>Delete</p></li>
        </ul>
      );
    } else {
      const targetStatusCode = (
        targetType === "node" ? COURSE_STATUS_CODES[targetStatus] : 0
      );
      const nodeOptions = [
        <li
          key="planned"
          className={targetStatusCode >= 2 ? "current" : ""}
          onClick={() => setSelectionStatuses([target], "ready")}
        >
          <p>Planned</p>
        </li>,
        <li
          key="enrolled"
          className={targetStatus === "enrolled" ? "current" : ""}
          onClick={() => setSelectionStatuses([target], "enrolled")}
        >
          <p>Enrolled</p>
        </li>,
        <li
          key="complete"
          className={targetStatus === "completed" ? "current" : ""}
          onClick={() => setSelectionStatuses([target], "completed")}
        >
          <p>Completed</p>
        </li>,
      ];
      const edgeOptions = [
        <li
          key="concurrent"
          className={targetStatus === "CC" ? "current" : ""}
          onClick={() => toggleEdgeConcurrency(target)}
        >
          <p>Concurrent</p>
        </li>
      ];

      return (
        <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
          {(targetType === "node" && targetStatusCode < 3) && nodeOptions}
          {(targetType === "edge") && edgeOptions}
          {(targetStatusCode < 3 || targetType === "edge") && <hr />}
          <li className="delete" onClick={() => deleteElems([target])}>
            <p>Delete</p>
          </li>
        </ul>
      );
    }
  } else {
    return null;
  }
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
  toggleEdgeConcurrency: PropTypes.func.isRequired,
  deleteElems: PropTypes.func.isRequired,
};
