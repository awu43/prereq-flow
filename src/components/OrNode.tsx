import React from "react";

import classNames from "classnames";

import { Handle } from "react-flow-renderer";

import type { BaseNodeData } from "types/main";

export default function OrNode({ data }: { data: BaseNodeData }) {
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
