/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes, { number } from "prop-types";

export default function ContextMenu({ active, xy, target }) {
  function setNodeCompleted() {

  }

  function setNodeEnrolled() {

  }

  function setNodePlanned() {

  }

  function setEdgeConcurrent() {

  }

  function deleteElement() {

  }

  if (active) {
    return (
      <ul className="ContextMenu" style={{ top: xy[1], left: xy[0] }}>
        <li onClick={setNodeCompleted}><p>Completed</p></li>
        <li onClick={setNodeEnrolled}><p>Enrolled</p></li>
        <li onClick={setNodePlanned}><p>Planned</p></li>
        <li onClick={setEdgeConcurrent}><p>Concurrent</p></li>
        <hr />
        <li onClick={deleteElement}><p>Delete</p></li>
      </ul>
    );
  } else {
    return null;
  }
}
ContextMenu.propTypes = {
  active: PropTypes.bool.isRequired,
  xy: PropTypes.arrayOf(number).isRequired,
  target: PropTypes.string.isRequired,
};
