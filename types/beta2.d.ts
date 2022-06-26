import type { XYPosition } from "react-flow-renderer";

type Campus = "Seattle" | "Bothell" | "Tacoma";

interface CourseData {
  campus?: Campus;
  id: string;
  name: string;
  credits: string;
  description: string;
  prerequisite: string;
  offered: string;
}

type CourseStatus =
  | "completed"
  | "enrolled"
  | "ready"
  | `${"under-one" | "one" | "over-one"}-away`;

type ConditionalTypes = "or" | "and";

type NodeId = string;
type EdgeId = string;
type ElementId = NodeId | EdgeId;

interface BaseNode {
  id: NodeId;
  position: XYPosition;
}

interface BaseNodeData {
  nodeStatus: CourseStatus;
  nodeConnected: boolean;
}

interface CourseNodeData extends CourseData, BaseNodeData {}

interface CourseNode extends BaseNode {
  type: "course";
  data: CourseNodeData;
}

interface ConditionalNode extends BaseNode {
  type: ConditionalTypes;
  data: BaseNodeData;
}

type Node = CourseNode | ConditionalNode;

interface Edge {
  id: EdgeId;
  type: "custom";
  source: NodeId;
  target: NodeId;
  className: CourseStatus;
  data: { concurrent: boolean };
  animated?: boolean;
}

export type Element = Node | Edge;
