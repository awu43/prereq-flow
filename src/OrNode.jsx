import React from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import { Handle } from "react-flow-renderer";

// TEST
export default function OrNode({ data }) {
  return (
    <div
      className={classNames(
        "OrNode", data.nodeStatus, { connected: data.nodeConnected }
      )}
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
