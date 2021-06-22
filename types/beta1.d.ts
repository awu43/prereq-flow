import type {
  XYPosition,
} from "react-flow-renderer";

type Campus = "Seattle" | "Bothell" | "Tacoma";

interface CurriculumData {
  campus: Campus;
  id: string;
  name: string;
}

type NodeId = string;
type EdgeId = string;
type ElementId = NodeId | EdgeId;

interface CourseData {
  campus?: Campus;
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

type ConditionalTypes = "or" | "and";
// type NodeTypes = "course" | ConditionalTypes;

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
  source: NodeId;
  target: NodeId;
  className: CourseStatus;
  label: null | string;
  animated?: boolean;
}

type Element = Node | Edge;
