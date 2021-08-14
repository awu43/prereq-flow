import type { Dispatch, SetStateAction, ReactElement } from "react";
import type { XYPosition } from "react-flow-renderer";

export type SetState<Type> = Dispatch<SetStateAction<Type>>;

type WriteOnlyMap<K, V> = Omit<Map<K, V>, "get">;

export type AlwaysDefinedMap<K, V> = WriteOnlyMap<K, V> & {
  get: (key: K) => V;
};

export type Campus = "Seattle" | "Bothell" | "Tacoma";

export type NodeId = string;
export type EdgeId = string;
export type ElementId = NodeId | EdgeId;

export interface CourseData {
  campus?: Campus;
  id: string;
  name: string;
  credits: string;
  description: string;
  prerequisite: string;
  offered: string;
}

export type CourseStatus = (
  "completed" | "enrolled" | "ready"
  | `${"under-one" | "one" | "over-one"}-away`
);

export type ConditionalTypes = "or" | "and";
// type NodeTypes = "course" | ConditionalTypes;

interface BaseNode {
  id: NodeId;
  position: XYPosition;
}

export interface BaseNodeData {
  nodeStatus: CourseStatus;
  nodeConnected: boolean;
}

export interface CourseNodeData extends CourseData, BaseNodeData {}

export interface CourseNode extends BaseNode {
  type: "course";
  data: CourseNodeData;
}

export interface ConditionalNode extends BaseNode {
  type: ConditionalTypes;
  data: BaseNodeData;
}

export type Node = CourseNode | ConditionalNode;

export type InnerText = (string | ReactElement)[];

export interface Edge {
  id: EdgeId;
  type: "custom";
  source: NodeId;
  target: NodeId;
  className: CourseStatus;
  data: { concurrent: boolean; };
  animated?: boolean;
}

export type Element = Node | Edge;

interface NodeDataValue {
  depth: number;
  incomingNodes: NodeId[];
  incomingEdges: EdgeId[];
  outgoingEdges: EdgeId[];
  outgoingNodes: NodeId[];
}
export type NodeDataMap = AlwaysDefinedMap<NodeId, NodeDataValue>;

type NodeIndex = number;
type EdgeIndex = number;
type ElementIndex = NodeIndex | EdgeIndex;

export type ElemIndexMap = AlwaysDefinedMap<ElementId, ElementIndex>;

export interface ConnectTo {
  prereq: boolean;
  postreq: boolean;
}

export type NewCoursePosition = "zero" | "relative";
