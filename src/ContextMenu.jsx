/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes, { number } from "prop-types";

export default function ContextMenu({
  active, type, xy, target, targetStatus, COURSE_STATUS_CODES,
  setSelectionStatuses, toggleEdgeConcurrency, deleteElems
}) {
  if (active) {
    if (type === "selection") {
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
          <li onClick={() => deleteElems(target)}><p>Delete</p></li>
        </ul>
      );
    } else {
      const targetStatusCode = (
        type === "node" ? COURSE_STATUS_CODES[targetStatus] : 0
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
          {(type === "node" && targetStatusCode < 3) && nodeOptions}
          {(type === "edge") && edgeOptions}
          {(targetStatusCode < 3 || type === "edge") && <hr />}
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
// https://github.com/davidje13/prop-types-nullable
function nullable(subRequirement) {
  const check = (required, props, key, ...rest) => {
    if (props[key] === null) {
      return null;
    }
    const sub = required ? subRequirement.isRequired : subRequirement;
    return sub(props, key, ...rest);
  };
  const fn = check.bind(null, false);
  fn.isRequired = check.bind(null, true);
  return fn;
}
ContextMenu.propTypes = {
  active: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  xy: PropTypes.arrayOf(number).isRequired,
  target: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.arrayOf(PropTypes.string).isRequired,
  ]),
  targetStatus: nullable(PropTypes.string).isRequired,
  COURSE_STATUS_CODES: PropTypes.objectOf(PropTypes.number).isRequired,
  setSelectionStatuses: PropTypes.func.isRequired,
  toggleEdgeConcurrency: PropTypes.func.isRequired,
  deleteElems: PropTypes.func.isRequired,
};
