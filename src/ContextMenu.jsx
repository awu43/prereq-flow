/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes, { number } from "prop-types";

export default function ContextMenu({
  active, type, xy, target, setNodeStatuses, toggleEdgeCon, deleteElems
}) {
  if (active) {
    if (type === "selection") {
      const nodeOptions = [
        <li key="planned" onClick={() => setNodeStatuses(target, "ready")}>
          <p>Planned</p>
        </li>,
        <li key="enrolled" onClick={() => setNodeStatuses(target, "enrolled")}>
          <p>Enrolled</p>
        </li>,
        <li key="complete" onClick={() => setNodeStatuses(target, "completed")}>
          <p>Completed</p>
        </li>,
      ];

      return (
        <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
          {nodeOptions}
          <hr />
          <li onClick={() => deleteElems(target)}><p>Delete</p></li>
        </ul>
      );
    } else {
      const nodeOptions = [
        <li
          key="planned"
          onClick={() => setNodeStatuses([target], "ready")}
        >
          <p>Planned</p>
        </li>,
        <li
          key="enrolled"
          onClick={() => setNodeStatuses([target], "enrolled")}
        >
          <p>Enrolled</p>
        </li>,
        <li
          key="complete"
          onClick={() => setNodeStatuses([target], "completed")}
        >
          <p>Completed</p>
        </li>,
      ];
      const edgeOptions = [
        <li key="concurrent" onClick={() => toggleEdgeCon(target)}>
          <p>Concurrent</p>
        </li>
      ];

      return (
        <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
          {(type === "node") && nodeOptions}
          {(type === "edge") && edgeOptions}
          <hr />
          <li onClick={() => deleteElems([target])}><p>Delete</p></li>
        </ul>
      );
    }
  } else {
    return null;
  }
}
ContextMenu.propTypes = {
  active: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  xy: PropTypes.arrayOf(number).isRequired,
  target: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.string).isRequired,
  ]),
  setNodeStatuses: PropTypes.func.isRequired,
  toggleEdgeCon: PropTypes.func.isRequired,
  deleteElems: PropTypes.func.isRequired,
};
