import React from "react";
import PropTypes from "prop-types";

import { Handle } from "react-flow-renderer";

const defaultNodeStyle = {
  padding: "10px",
  // "border-radius": "3px",
  width: "150px",
  // "fontSize": "12px",
  // color: "#222",
  textAlign: "center",
  // "border-width": "1px",
  borderStyle: "solid",
};

export default function CustomNode({ data }) {
  return (
    <div
      className={`CustomNode ${data.nodeStatus}${
        data.nodeConnected ? " connected" : ""}`}
      style={defaultNodeStyle}
    >
      <Handle type="target" position="left" />
      <div>{data.id}</div>
      <Handle type="source" position="right" />
    </div>
  );
}
CustomNode.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    credits: PropTypes.string,
    description: PropTypes.string,
    prerequisite: PropTypes.string,
    offered: PropTypes.string,
    nodeStatus: PropTypes.string,
    nodeConnected: PropTypes.bool,
  }).isRequired,
};
