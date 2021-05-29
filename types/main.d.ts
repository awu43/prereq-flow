export interface XYPosition {
  x: number;
  y: number;
}

export type NodeId = string;
export type EdgeId = string;
export type ElementId = NodeId | EdgeId;

export interface CourseData {
  campus: string;
  id: string;
  name: string;
  credits: string;
  description: string;
  prerequisite: string;
  offered: string;
}

export type CourseStatus = (
  "completed" | "enrolled"| "ready" | `${"under-one" | "one" | "over-one"}-away`
);

export type ConditionalTypes = "or" | "and";
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

export interface CourseNode extends BaseNode {
  type: "course";
  data: CourseNodeData;
}

export interface ConditionalNode extends BaseNode {
  type: ConditionalTypes;
  data: BaseNodeData;
}

export type Node = CourseNode | ConditionalNode;

export interface Edge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  className: CourseStatus;
  label: null | string;
}

export type Element = Node | Edge;

type WriteOnlyMap<K, V> = Omit<Map<K, V>, "get">;

export type AlwaysDefinedMap<K, V> = WriteOnlyMap<K, V> & {
  get: (key: K) => V;
};

export interface NodeDataValue {
  depth: number;
  incomingNodes: NodeId[];
  incomingEdges: EdgeId[];
  outgoingEdges: EdgeId[];
  outgoingNodes: NodeId[];
}
export type NodeDataMap = AlwaysDefinedMap<NodeId, NodeDataValue>;

type NodeIndex = number;
type EdgeIndex = number;
export type ElementIndex = NodeIndex | EdgeIndex;

export type ElemIndexMap = AlwaysDefinedMap<ElementId, ElementIndex>;
