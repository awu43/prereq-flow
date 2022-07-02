import classNames from "classnames";

import { Handle, Position } from "react-flow-renderer";

import type { BaseNodeData } from "types/main";

export default function OrNode({ data }: { data: BaseNodeData }): JSX.Element {
  return (
    <div
      className={classNames("OrNode", data.nodeStatus, {
        connected: data.nodeConnected,
      })}
    >
      <Handle type="target" position={Position.Left} />
      <div>OR</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
