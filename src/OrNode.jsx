import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { Handle } from "react-flow-renderer";

const orNodeStyle = {
  padding: "10px",
  // "border-radius": "3px",
  // minWidth: "150px",
  // "fontSize": "12px",
  // color: "#222",
  textAlign: "center",
  // "border-width": "1px",
  borderStyle: "solid",
};
// TEST
export default function OrNode({ data }) {
  return (
    <div
      className={classNames(
        "CourseNode", data.nodeStatus, { connected: data.nodeConnected }
      )}
      style={orNodeStyle}
    >
      <Handle type="target" position="left" />
      <div>OR</div>
      <Handle type="source" position="right" />
    </div>
  );
}
OrNode.propTypes = {
  data: PropTypes.shape({
    nodeStatus: PropTypes.string,
    nodeConnected: PropTypes.bool,
  }).isRequired,
};
