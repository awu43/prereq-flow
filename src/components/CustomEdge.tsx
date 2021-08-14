import React from "react";

import {
  Position,
  getBezierPath,
  getEdgeCenter,
  EdgeText,
} from "react-flow-renderer";

const CONCURRENT_LABEL = {
  label: "CC",
  labelBgPadding: [2, 2] as [number, number],
  labelBgBorderRadius: 4,
};

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data: { concurrent: boolean };
}
export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = { concurrent: false },
}: CustomEdgeProps): JSX.Element {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const [centerX, centerY, _offsetX, _offsetY] = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <path className="react-flow__edge-path" d={edgePath} data-testid={id} />
      <EdgeText
        x={centerX}
        y={centerY}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...(data.concurrent ? CONCURRENT_LABEL : {})}
      />
    </>
  );
}
