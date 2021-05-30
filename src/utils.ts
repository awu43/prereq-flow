import { nanoid } from "nanoid";

import dagre from "dagre";

import { isNode as isNodeBase, removeElements } from "react-flow-renderer";

import type {
  XYPosition,
  NodeId,
  EdgeId,
  ElementId,
  ConditionalTypes,
  CourseData,
  CourseStatus,
  CourseNode,
  ConditionalNode,
  Node,
  Edge,
  Element,
  AlwaysDefinedMap,
  NodeDataMap,
  ElemIndexMap,
  ElementIndex,
  AmbiguityHandling,
} from "../types/main";

// Wrapped to narrow type
function isNode(elem: Element): elem is Node {
  return isNodeBase(elem);
}

function isCourseNode(node: Node): node is CourseNode {
  return node.type === "course";
}

export const ZERO_POSITION: XYPosition = { x: 0, y: 0 };
const CRS = String.raw`(?:[A-Z&]+ )+\d{3}`; // COURSE_REGEX_STRING
export const COURSE_REGEX = new RegExp(CRS, "g"); // AAA 000

const EITHER_OR_REGEX = /\b(?:[Ei]ther|or)\b/;

const DOUBLE_EITHER_REGEX = new RegExp(`(?:[Ee]ither )?(${CRS}) or (${CRS})`);
// "AAA 000 or AAA 111"
const TRIPLE_EITHER_REGEX = new RegExp(
  `(?:[Ee]ither )?(${CRS}), (${CRS}),? or (${CRS})`
);
// "AAA 000, AAA 111, or AAA 222"

const CONCURRENT_REGEX = (
  /(?:either of )?which may be taken concurrently(?:\. Instructor|\.?$)/
);

export function newCourseNode(courseData: CourseData): CourseNode {
  return {
    id: courseData.id,
    type: "course",
    position: ZERO_POSITION,
    data: {
      ...courseData,
      nodeStatus: "over-one-away",
      nodeConnected: false,
    }
  };
}

export function newConditionalNode(
  type: ConditionalTypes,
  position: XYPosition = ZERO_POSITION,
): ConditionalNode {
  return {
    id: `${type.toUpperCase()}-${nanoid()}`,
    type,
    position,
    data: {
      nodeStatus: "completed",
      nodeConnected: false,
    }
  };
}

export function edgeArrowId(source: NodeId, target: NodeId): EdgeId {
  return `${source} -> ${target}`;
}

export function newEdge(
  source: NodeId,
  target: NodeId,
  id: EdgeId = "",
): Edge {
  const edgeId = id || edgeArrowId(source, target);
  return {
    id: edgeId,
    source,
    target,
    className: "over-one-away",
    label: null, // Need to have this in order to notify React Flow about CC
  };
}

function addEdges(
  sources: NodeId[],
  target: NodeId,
  elements: Element[],
  elementIds: Set<ElementId>,
): void {
  for (const source of sources) {
    const edgeId = edgeArrowId(source, target);
    if (elementIds.has(source)
        && !elementIds.has(edgeId)
        && !elementIds.has(edgeArrowId(target, source))) { // For BIOL cycles
      elements.push(newEdge(source, target, edgeId));
      elementIds.add(edgeId);
    }
  }
}

export const CONCURRENT_LABEL = {
  label: "CC",
  labelBgPadding: [2, 2],
  labelBgBorderRadius: 4,
};

export function generateInitialElements(
  courseData: CourseData[],
  ambiguityHandling: AmbiguityHandling,
): Element[] {
  const elements: Element[] = courseData.map(c => newCourseNode(c));
  const elementIds: Set<ElementId> = new Set(courseData.map(c => c.id));
  const secondPass = new Map() as AlwaysDefinedMap<ElementId, RegExpMatchArray>;

  // First pass: unambiguous prerequisites
  for (const data of courseData) {
    const courseId = data.id;
    const { prerequisite } = data;
    if (!COURSE_REGEX.test(prerequisite)) {
      // No prerequisites
      continue;
    }

    const reqSections = prerequisite.split(";");
    for (const section of reqSections) {
      const courseMatches = section.match(COURSE_REGEX);
      if (!courseMatches) {
        continue;
      } else if (courseMatches.length === 1) {
        addEdges(courseMatches, courseId, elements, elementIds);
      } else {
        if (!secondPass.has(courseId)) {
          secondPass.set(courseId, []);
        }
        secondPass.get(courseId).push(section);
      }
    }
  }
  // TODO: E E 215 "a or (b and (c or d))"
  // TODO: MATH 309 "(a and b) or c"
  // State machine maybe (look into JSON parsing)
  // TODO: Co-requisites

  // Second pass: single "or" prerequisites and unparsable
  for (const [course, problemSection] of secondPass.entries()) {
    for (const section of problemSection) {
      const doubleEitherMatch = section.match(DOUBLE_EITHER_REGEX);
      const tripleEitherMatch = section.match(TRIPLE_EITHER_REGEX);
      const matches = tripleEitherMatch || doubleEitherMatch;
      // Double can match triple but not the other way around
      const numCourses = (
        (section.match(COURSE_REGEX) as RegExpMatchArray).length
      );

      if (matches && matches.length === numCourses + 1) {
        // If not all courses captured (i.e. 3+), it's a false match
        // matches includes full string match

        const alreadyRequired: ElementId[] = (
          matches.slice(1).filter(m => elementIds.has(m))
        );
        if (alreadyRequired.length === 1) {
          // One option is already required
          let edge = newEdge(alreadyRequired[0], course);
          if (CONCURRENT_REGEX.test(section)) {
            edge = { ...edge, ...CONCURRENT_LABEL };
          }
          elements.push(edge);
        } else if (alreadyRequired.length > 1) {
          // More than one option is already required
          const orNode = newConditionalNode("or");
          elements.push(orNode);
          elements.push(newEdge(orNode.id, course));
          for (const req of alreadyRequired) {
            let edge = newEdge(req, orNode.id);
            if (CONCURRENT_REGEX.test(section)) {
              edge = { ...edge, ...CONCURRENT_LABEL };
            }
            elements.push(edge);
          }
        } else if (ambiguityHandling === "aggressively") {
          addEdges(matches.slice(1), course, elements, elementIds);
        }
      } else if (ambiguityHandling === "aggressively") {
        addEdges(
          section.match(COURSE_REGEX) as RegExpMatchArray,
          course,
          elements,
          elementIds
        );
      }
    }
  }
  return elements;
}

function discoverMaxDepths(
  startNodeId: NodeId,
  startDepth: number,
  nodeData: NodeDataMap,
): void {
  for (const outgoerId of nodeData.get(startNodeId).outgoingNodes) {
    nodeData.get(outgoerId).depth = Math.max(
      nodeData.get(outgoerId).depth, startDepth + 1
    );
    discoverMaxDepths(outgoerId, startDepth + 1, nodeData);
  }
}

export function newNodeData(elements: Element[]): NodeDataMap {
  const initialNodeData = new Map();

  function setNewNode(nodeId: NodeId) {
    if (!initialNodeData.has(nodeId)) {
      initialNodeData.set(nodeId, {
        depth: 0,
        incomingNodes: [],
        incomingEdges: [],
        outgoingEdges: [],
        outgoingNodes: [],
      });
    }
  }

  for (const elem of elements) {
    const elemId = elem.id;

    if (isNode(elem)) {
      setNewNode(elemId);
    } else {
      const { source, target } = elem;
      setNewNode(source);
      setNewNode(target);

      const sourceNode = initialNodeData.get(source);
      const targetNode = initialNodeData.get(target);
      sourceNode.outgoingEdges.push(elemId);
      sourceNode.outgoingNodes.push(target);
      targetNode.incomingEdges.push(elemId);
      targetNode.incomingNodes.push(source);
    }
  }

  const roots = elements.filter(elem => (
    isNode(elem) && !initialNodeData.get(elem.id).incomingEdges.length
  ));
  for (const root of roots) {
    discoverMaxDepths(root.id, 0, initialNodeData);
  }

  return initialNodeData;
}

export function sortElementsByDepth(
  elements: Element[],
  nodeData: NodeDataMap,
): Element[] {
  return elements.sort((a, b) => {
    const aVal = (
      isNode(a) ? nodeData.get(a.id).depth : Number.POSITIVE_INFINITY
    );
    const bVal = (
      isNode(b) ? nodeData.get(b.id).depth : Number.POSITIVE_INFINITY
    );

    return aVal - bVal;
  });
}

export function newElemIndexes(
  elements: Element[],
): Map<ElementId, ElementIndex> {
  return new Map(elements.map((elem, i) => [elem.id, i]));
}

const COURSE_STATUSES: CourseStatus[] = [
  "completed", // 0
  "enrolled", // 1
  "ready", // 2
  "under-one-away", // 3
  "one-away", // 4
  "over-one-away", // 5
];

export const COURSE_STATUS_CODES = Object.freeze(Object.fromEntries(
  COURSE_STATUSES.map((status, i) => [status, i])
));

export function setNodeStatus(
  nodeId: NodeId,
  newStatus: CourseStatus,
  elements: Element[],
  nodeData: NodeDataMap,
  elemIndexes: ElemIndexMap,
): void {
  (elements[elemIndexes.get(nodeId)] as Node).data.nodeStatus = newStatus;
  for (const edgeId of nodeData.get(nodeId).outgoingEdges) {
    elements[elemIndexes.get(edgeId)] = {
      ...elements[elemIndexes.get(edgeId)], className: newStatus
    } as Edge;
  }
}

function getEdgeStatusCode(edge: Edge): number {
  let edgeStatusCode = COURSE_STATUS_CODES[edge.className];
  if (edgeStatusCode === COURSE_STATUS_CODES.enrolled
      && edge.label === "CC") {
    edgeStatusCode = COURSE_STATUS_CODES.completed;
  }
  return edgeStatusCode;
}

export function updateNodeStatus(
  nodeId: NodeId,
  elements: Element[],
  nodeData: NodeDataMap,
  elemIndexes: ElemIndexMap,
): void {
  const targetNode = elements[elemIndexes.get(nodeId)] as Node;
  const currentStatus = targetNode.data.nodeStatus;
  const incomingEdges = nodeData.get(nodeId).incomingEdges.map(id => (
    elements[elemIndexes.get(id)]
  )) as Edge[];

  let newStatus;
  switch (targetNode.type) {
    case "course": {
      let newStatusCode = Math.max(...incomingEdges.map(getEdgeStatusCode));
      newStatusCode = (
        newStatusCode === Number.NEGATIVE_INFINITY ? 0 : newStatusCode
      );
      // Math.max() with no args -> negative infinity

      if (newStatusCode === 0) {
        newStatus = (
          currentStatus === "completed" || currentStatus === "enrolled"
            ? currentStatus
            : "ready"
        );
        // All prereqs completed (or concurrently enrolled)
      } else if (newStatusCode === 1) {
        newStatus = "under-one-away";
        // All prereqs will be complete after finishing currently enrolled
      } else if (newStatusCode === 2) {
        newStatus = "one-away";
        // All prereqs ready for enrollment
      } else if (newStatusCode > 2) {
        newStatus = "over-one-away";
        // At least one prereq not ready for enrollment
      }
      break;
    }
    case "and": {
      let newStatusCode = Math.max(...incomingEdges.map(getEdgeStatusCode));
      newStatusCode = (
        newStatusCode === Number.NEGATIVE_INFINITY ? 0 : newStatusCode
      );
      // Math.max() with no args -> negative infinity

      newStatus = COURSE_STATUSES[newStatusCode];
      // AND node should be complete if no prereqs
      break;
    }
    case "or": {
      let newStatusCode = Math.min(...incomingEdges.map(getEdgeStatusCode));
      newStatusCode = (
        newStatusCode === Number.POSITIVE_INFINITY ? 0 : newStatusCode
      );
      // Math.min() with no args -> positive infinity

      newStatus = COURSE_STATUSES[newStatusCode];
    }
      break;
    default:
      break;
  }

  setNodeStatus(
    nodeId, newStatus as CourseStatus, elements, nodeData, elemIndexes
  );
}

export function updateAllNodes(
  elements: Element[],
  nodeData: NodeDataMap,
  elemIndexes: ElemIndexMap,
): Element[] {
  const updatedElements = elements.slice();
  const numNodes = nodeData.size;
  for (let i = 0; i < numNodes; i++) {
    updateNodeStatus(elements[i].id, updatedElements, nodeData, elemIndexes);
  }
  return updatedElements;
}

const nodesep = 75; // Vertical spacing
const ranksep = 250; // Horizontal spacing
const nodeWidth = 172;
const nodeHeight = 36;

export const nodeSpacing = ranksep + nodeWidth;
// For autopositioning

function generateDagreLayout(elements: Element[]): Element[] {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep, nodesep });

  for (const elem of elements) {
    if (isNode(elem)) {
      dagreGraph.setNode(elem.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(elem.source, elem.target);
    }
  }

  dagre.layout(dagreGraph);

  const arrangedElements = elements.map(elem => {
    if (isNode(elem)) {
      const node = dagreGraph.node(elem.id);

      // Slight random change is needed as a hack to notify react flow
      // about the change.
      // This also shifts the dagre node anchor (center center) to
      // match react flow anchor (top left)
      elem.position = {
        x: node.x - (nodeWidth / 2) + (Math.random() / 1000),
        y: node.y - (nodeHeight / 2),
      };
    }

    return elem;
  });

  return arrangedElements;
}

function filterUnconditionalElements(
  condNodes: ConditionalNode[],
  elements: Element[],
  nodeData: NodeDataMap,
): Element[] {
  let tempElements = elements.slice();
  let tempNodeData = new Map(nodeData.entries()) as NodeDataMap;

  for (const elem of condNodes) {
    const node = tempNodeData.get(elem.id);

    for (const iNode of node.incomingNodes) {
      for (const oNode of node.outgoingNodes) {
        const edgeId = edgeArrowId(iNode, oNode);
        if (!tempNodeData.has(edgeId)) {
          tempElements.push(newEdge(iNode, oNode));
        }
      }
    }
    tempElements = removeElements([elem], tempElements) as Element[];
    tempNodeData = newNodeData(tempElements);
  }

  return tempElements;
}

function getSourcePositions(
  nodeId: NodeId,
  elements: Element[],
  elemIndexes: ElemIndexMap,
  nodeData: NodeDataMap,
): XYPosition | XYPosition[] {
  const node = elements[elemIndexes.get(nodeId)] as Node;
  return (
    node.type === "course"
      ? node.position
      : (
        nodeData.get(nodeId).incomingNodes
          .map(nId => getSourcePositions(nId, elements, elemIndexes, nodeData))
          .flat()
      )
  );
}

function averagePosition(positions: XYPosition[]): XYPosition {
  const avgSourcePosition = positions.reduce((a, b) => (
    { x: a.x + b.x, y: a.y + b.y }
  ), ZERO_POSITION);
  avgSourcePosition.x /= positions.length;
  avgSourcePosition.y /= positions.length;
  return avgSourcePosition;
}

export function averageYPosition(positions: XYPosition[]): number {
  return (
    positions
      .map(pos => pos.y)
      .reduce((a, b) => a + b)
      / positions.length
  );
}

export function generateNewLayout(
  elements: Element[],
  elemIndexes: ElemIndexMap,
  nodeData: NodeDataMap,
): Element[] {
  const newElements = elements.slice();

  // Conditional nodes should not influence course depth/positioning
  const conditionalNodes = elements.filter(elem => (
    isNode(elem) && !isCourseNode(elem)
  )) as ConditionalNode[];

  let dagreLayout;
  if (!conditionalNodes.length) {
    dagreLayout = generateDagreLayout(
      elements.slice().sort(() => Math.random() - 0.5)
    );
  } else {
    const filteredElements = filterUnconditionalElements(
      conditionalNodes, elements, nodeData
    );

    // https://flaviocopes.com/how-to-shuffle-array-javascript/
    dagreLayout = generateDagreLayout(
      filteredElements.sort(() => Math.random() - 0.5)
    );
  }

  for (const dagElem of dagreLayout) {
    if (isNode(dagElem)) {
      const i = elemIndexes.get(dagElem.id);
      (newElements[i] as CourseNode).position = dagElem.position;
    }
  }

  conditionalNodes.reverse();
  for (const node of conditionalNodes) {
    const i = elemIndexes.get(node.id);
    const data = nodeData.get(node.id);
    const { incomingNodes, outgoingNodes } = data;

    if (incomingNodes.length && outgoingNodes.length) {
      const incomingPositions = incomingNodes.map(nodeId => (
        getSourcePositions(nodeId, elements, elemIndexes, nodeData)
      )).flat();
      const outgoingPositions = outgoingNodes.map(nodeId => (
        (newElements[elemIndexes.get(nodeId)] as Node).position
      ));

      const x = (
        Math.min(...outgoingPositions.map(pos => pos.x)) - nodeWidth * 0.5
      );
      const avgSourcePosition = averagePosition(incomingPositions);
      const avgDestPosition = averagePosition(outgoingPositions);
      const slope = (
        (avgDestPosition.y - avgSourcePosition.y)
        / (avgDestPosition.x - avgSourcePosition.x)
      );
      const y = -nodeWidth * slope + avgDestPosition.y;

      (newElements[i] as ConditionalNode).position = { x, y };
    } else if (incomingNodes.length && !outgoingNodes.length) {
      const incomingPositions = incomingNodes.map(nodeId => (
        (newElements[elemIndexes.get(nodeId)] as Node).position
      ));

      const x = (
        Math.max(...incomingPositions.map(pos => pos.x)) + nodeWidth * 1.1
      );
      const y = averageYPosition(incomingPositions);

      (newElements[i] as ConditionalNode).position = { x, y };
    } else if (!incomingNodes.length && outgoingNodes.length) {
      const outgoingPositions = outgoingNodes.map(nodeId => (
        (newElements[elemIndexes.get(nodeId)] as Node).position
      ));

      const x = (
        Math.min(...outgoingPositions.map(pos => pos.x)) - nodeWidth * 0.5
      );
      const y = averageYPosition(outgoingPositions);

      (newElements[i] as ConditionalNode).position = { x, y };
    }
  }
  // Magic multipliers to compensate for unkown conditional node width

  return newElements;
}

export function resetElementStates(newElements: Element[]): Element[] {
  return newElements.map(elem => (
    isNode(elem)
      ? { ...elem, data: { ...elem.data, nodeConnected: false } } as Node
      : { ...elem, animated: false } as Edge
  ));
}

export function autoconnect(
  targetNode: CourseNode,
  newElements: Element[],
  numNodes: number,
  elemIndexes: ElemIndexMap,
  reposition = false,
): Element[] {
  const targetId = targetNode.id;
  const courseMatches = targetNode.data.prerequisite.match(COURSE_REGEX);
  const targetPrereqs = (
    courseMatches
      ? courseMatches.filter(elemId => elemIndexes.has(elemId))
        .filter(elemId => !elemIndexes.has(edgeArrowId(elemId, targetId)))
        .map(elemId => newElements[elemIndexes.get(elemId)]) as CourseNode[]
      : []
  );
  const targetPostreqs = [];
  for (let i = 0; i < numNodes; i++) {
    const postreq = newElements[i] as Node;
    if (isCourseNode(postreq)
        && (postreq).data.prerequisite.includes(targetId)
        && !elemIndexes.has(edgeArrowId(targetId, postreq.id))) {
      targetPostreqs.push(postreq);
    }
  }
  // Avoid traversing edges

  for (const prereq of targetPrereqs) {
    newElements.push(newEdge(prereq.id, targetId));
  }
  for (const postreq of targetPostreqs) {
    newElements.push(newEdge(targetId, postreq.id));
  }

  if (reposition) {
    const prereqPositions = targetPrereqs.map(elem => elem.position);
    const postreqPositions = targetPostreqs.map(elem => elem.position);
    if (prereqPositions.length && postreqPositions.length) {
      const allPositions = prereqPositions.concat(postreqPositions);

      const x = (
        Math.max(...prereqPositions.map(pos => pos.x))
        + Math.min(...postreqPositions.map(pos => pos.x))
      ) / 2;
      const y = averageYPosition(allPositions);

      targetNode.position = { x, y };
    } else if (prereqPositions.length && !postreqPositions.length) {
      const x = Math.max(...prereqPositions.map(pos => pos.x)) + nodeSpacing;
      const y = averageYPosition(prereqPositions);

      targetNode.position = { x, y };
    } else if (!prereqPositions.length && postreqPositions.length) {
      const x = Math.min(...postreqPositions.map(pos => pos.x)) - nodeSpacing;
      const y = averageYPosition(postreqPositions);

      targetNode.position = { x, y };
    }
  }

  if (!elemIndexes.has(targetId)) {
    newElements.push(targetNode);
  }

  return newElements;
}

export const _testing = {
  EITHER_OR_REGEX,
  COURSE_REGEX,
  DOUBLE_EITHER_REGEX,
  TRIPLE_EITHER_REGEX,
  CONCURRENT_REGEX,
};
