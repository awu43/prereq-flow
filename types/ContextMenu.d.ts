import type { ReactElement } from "react";
import type { XYPosition } from "react-flow-renderer";

import type {
  CourseStatus,
  NodeId,
  EdgeId,
  ElementId,
  ConditionalTypes,
  Element,
  NodeDataMap,
  ElemIndexMap,
  ConnectTo,
} from "types/main";

type ContextTargetType =
  | "coursenode"
  | "conditionalnode"
  | "edge"
  | "coursemultiselect"
  | "conditionalmultiselect"
  | "mixedmultiselect"
  | "courseselection"
  | "conditionalselection"
  | "pane";

type ContextTargetStatus = CourseStatus | "" | "concurrent";

interface ContextTarget {
  target: ElementId[];
  targetType: ContextTargetType;
  targetStatus: ContextTargetStatus;
}

interface ContextMenuProps {
  elements: Element[];
  nodeData: NodeDataMap;
  elemIndexes: ElemIndexMap;
  active: boolean;
  data: ContextTarget;
  xy: XYPosition;
  setSelectionStatuses: (nodeIds: NodeId[], newStatus: CourseStatus) => void;
  toggleEdgeConcurrency: (edgeId: EdgeId) => void;
  editCourseData: (courseId: NodeId) => void;
  deleteElems: (elemIds: ElementId[]) => void;
  connect: (targetId: NodeId, to?: ConnectTo) => void;
  disconnect: (targetIds: NodeId[], from?: ConnectTo) => void;
  newConditionalNode: (type: ConditionalTypes, xy: XYPosition) => void;
  rerouteSingle: (targetId: NodeId) => void;
  reroutePointless: () => void;
}

interface OptListProps {
  contextProps: ContextMenuProps;
  sharedOpts: Record<string, ReactElement>;
}
