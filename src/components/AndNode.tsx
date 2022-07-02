import classNames from "classnames";

import { Handle, Position } from "react-flow-renderer";

import type { BaseNodeData } from "types/main";

export default function AndNode({ data }: { data: BaseNodeData }): JSX.Element {
  return (
    <div
      className={classNames("AndNode", data.nodeStatus, {
        connected: data.nodeConnected,
      })}
    >
      <Handle type="target" position={Position.Left} />
      <div>AND</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
