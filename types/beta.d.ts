import type {
  XYPosition,
} from "react-flow-renderer";

type NodeId = string;
type EdgeId = string;
type ElementId = NodeId | EdgeId;

interface CourseData {
  id: string;
  name: string;
  credits: string;
  description: string;
  prerequisite: string;
  offered: string;
}

type CourseStatus = (
  "completed" | "enrolled" | "ready"
  | `${"under-one" | "one" | "over-one"}-away`
);

interface NodeData extends CourseData {
  nodeStatus: CourseStatus;
  nodeConnected: boolean;
}

export interface Node {
  id: NodeId;
  type: "custom";
  position: XYPosition;
  selected: boolean;
  data: NodeData;
}

interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  className: CourseStatus;
  label: null | string;
  animated?: boolean;
}

export type Element = Node | Edge;
