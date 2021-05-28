import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { Handle } from "react-flow-renderer";

export default function AndNode({ data }) {
  return (
    <div
      className={classNames(
        "AndNode", data.nodeStatus, { connected: data.nodeConnected }
      )}
    >
      <Handle type="target" position="left" />
      <div>AND</div>
      <Handle type="source" position="right" />
    </div>
  );
}
AndNode.propTypes = {
  data: PropTypes.shape({
    nodeStatus: PropTypes.string,
    nodeConnected: PropTypes.bool,
  }).isRequired,
};
