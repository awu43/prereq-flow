import React from "react";

import classNames from "classnames";

import { Handle } from "react-flow-renderer";

import type { BaseNodeData } from "types/main";

export default function AndNode({ data }: { data: BaseNodeData }) {
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
