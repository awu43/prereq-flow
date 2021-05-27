import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

import classNames from "classnames";

import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  isNode,
  isEdge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
} from "react-flow-renderer";
import dagre from "dagre";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import "./App.scss";

import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";
import FlowStoreLifter from "./FlowStoreLifter.jsx";
import Header from "./Header.jsx";
import CourseNode from "./CourseNode.jsx";
import OrNode from "./OrNode.jsx";
import AndNode from "./AndNode.jsx";
import ContextMenu from "./ContextMenu.jsx";
import NewFlowDialog from "./dialogs/NewFlowDialog.jsx";
import OpenFileDialog, { CURRENT_VERSION } from "./dialogs/OpenFileDialog.jsx";
import AddCourseDialog from "./dialogs/AddCourseDialog.jsx";
import AboutDialog from "./dialogs/AboutDialog.jsx";

import {
  newConditionalNode,
  COURSE_REGEX,
  edgeArrowId,
  newEdge,
  CONCURRENT_LABEL,
  ZERO_POSITION,
} from "./parse-courses.js";
import demoFlow from "./data/demo-flow.json";

function getIncomingEdges(targetNode, elements) {
  const connectedEdges = getConnectedEdges(
    [targetNode], elements.filter(elem => isEdge(elem))
  );
  return connectedEdges.filter(edge => edge.target === targetNode.id);
}
function getOutgoingEdges(targetNode, elements) {
  const connectedEdges = getConnectedEdges(
    [targetNode], elements.filter(elem => isEdge(elem))
  );
  return connectedEdges.filter(edge => edge.source === targetNode.id);
}

function discoverMaxDepths(startNodeId, startDepth, nodeData) {
  for (const outgoerId of nodeData.get(startNodeId).outgoingNodes) {
    nodeData.get(outgoerId).depth = Math.max(
      nodeData.get(outgoerId).depth, startDepth + 1
    );
    discoverMaxDepths(outgoerId, startDepth + 1, nodeData);
  }
}
function newNodeData(elements) {
  const initialNodeData = new Map();
  const roots = [];
  for (const node of elements.filter(elem => isNode(elem))) {
    const nodeId = node.id;
    const newData = {
      depth: 0,
      incomingNodes: getIncomers(node, elements).map(elem => elem.id),
      incomingEdges: getIncomingEdges(node, elements).map(elem => elem.id),
      outgoingEdges: getOutgoingEdges(node, elements).map(elem => elem.id),
      outgoingNodes: getOutgoers(node, elements).map(elem => elem.id),
    };
    newData.connectedEdges = [
      ...newData.incomingEdges, ...newData.outgoingEdges,
    ];
    newData.connectedNodes = [
      ...newData.incomingNodes, ...newData.outgoingNodes,
    ];
    initialNodeData.set(nodeId, newData);

    if (newData.incomingNodes.length === 0) {
      roots.push(nodeId);
    }
  }
  for (const root of roots) {
    discoverMaxDepths(root, 0, initialNodeData);
  }

  return initialNodeData;
}

function sortElementsByDepth(elements, nodeData) {
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

function newElemIndexes(elements) {
  return new Map(elements.map((elem, i) => [elem.id, i]));
}

const COURSE_STATUSES = [
  "completed", // 0
  "enrolled", // 1
  "ready", // 2
  "under-one-away", // 3
  "one-away", // 4
  "over-one-away", // 5
];

const COURSE_STATUS_CODES = Object.freeze(Object.fromEntries(
  COURSE_STATUSES.map((status, i) => [status, i])
));

function setNodeStatus(nodeId, newStatus, elements, nodeData, elemIndexes) {
  elements[elemIndexes.get(nodeId)].data.nodeStatus = newStatus;
  for (const edgeId of nodeData.get(nodeId).outgoingEdges) {
    elements[elemIndexes.get(edgeId)] = {
      ...elements[elemIndexes.get(edgeId)], className: newStatus
    };
  }
}

function getEdgeStatus(edge) {
  let edgeStatusCode = COURSE_STATUS_CODES[edge.className];
  if (edgeStatusCode === COURSE_STATUS_CODES.enrolled
      && edge.label === "CC") {
    edgeStatusCode = COURSE_STATUS_CODES.completed;
  }
  return edgeStatusCode;
}

function updateNodeStatus(nodeId, elements, nodeData, elemIndexes) {
  const targetNode = elements[elemIndexes.get(nodeId)];
  const currentStatus = targetNode.data.nodeStatus;
  const incomingEdges = nodeData.get(nodeId).incomingEdges.map(id => (
    elements[elemIndexes.get(id)]
  ));

  let newStatus;
  switch (targetNode.type) {
    case "course": {
      let newStatusCode = Math.max(...incomingEdges.map(getEdgeStatus));
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
      let newStatusCode = Math.max(...incomingEdges.map(getEdgeStatus));
      newStatusCode = (
        newStatusCode === Number.NEGATIVE_INFINITY ? 0 : newStatusCode
      );
      // Math.max() with no args -> negative infinity

      newStatus = COURSE_STATUSES[newStatusCode];
      // Add node should be complete if no prereqs
      break;
    }
    case "or": {
      let newStatusCode = Math.min(...incomingEdges.map(getEdgeStatus));
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

  setNodeStatus(nodeId, newStatus, elements, nodeData, elemIndexes);
}

function updateAllNodes(elements, nodeData, elemIndexes) {
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

const nodeSpacing = ranksep + nodeWidth;
// For autopositioning

function generateDagreLayout(elements) {
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

function filterUnconditionalElements(condNodes, elems, nData) {
  let tempElements = elems.slice();
  let tempNodeData = new Map(nData.entries());

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
    tempElements = removeElements([elem], tempElements);
    tempNodeData = newNodeData(tempElements);
  }

  return tempElements;
}

function getSourcePositions(nodeId, elems, indexes, nData) {
  const node = elems[indexes.get(nodeId)];
  return (
    node.type === "course"
      ? node.position
      : (
        nData.get(nodeId).incomingNodes
          .map(nId => getSourcePositions(nId, elems, indexes, nData))
          .flat()
      )
  );
}

function averagePosition(positions) {
  const avgSourcePosition = positions.reduce((a, b) => (
    { x: a.x + b.x, y: a.y + b.y }
  ), ZERO_POSITION);
  avgSourcePosition.x /= positions.length;
  avgSourcePosition.y /= positions.length;
  return avgSourcePosition;
}

function averageYPosition(positions) {
  return (
    positions
      .map(pos => pos.y)
      .reduce((a, b) => a + b)
      / positions.length
  );
}

function generateNewLayout(elems, indexes, nData) {
  const newElements = elems.slice();

  // Conditional nodes should not influence course depth/positioning
  const conditionalNodes = elems.filter(elem => (
    isNode(elem) && elem.type !== "course"
  ));

  let dagreLayout;
  if (!conditionalNodes.length) {
    dagreLayout = generateDagreLayout(
      elems.slice().sort(() => Math.random() - 0.5)
    );
  } else {
    const filteredElements = filterUnconditionalElements(
      conditionalNodes, elems, nData
    );

    // https://flaviocopes.com/how-to-shuffle-array-javascript/
    dagreLayout = generateDagreLayout(
      filteredElements.sort(() => Math.random() - 0.5)
    );
  }

  for (const dagElem of dagreLayout) {
    if (isNode(dagElem)) {
      const i = indexes.get(dagElem.id);
      newElements[i].position = dagElem.position;
    }
  }

  conditionalNodes.reverse();
  for (const node of conditionalNodes) {
    const i = indexes.get(node.id);
    const data = nData.get(node.id);
    const { incomingNodes, outgoingNodes } = data;

    if (incomingNodes.length && outgoingNodes.length) {
      const incomingPositions = incomingNodes.map(nodeId => (
        getSourcePositions(nodeId, elems, indexes, nData)
      )).flat();
      const outgoingPositions = outgoingNodes.map(nodeId => (
        newElements[indexes.get(nodeId)].position
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
      newElements[i].position = { x, y };
    } else if (incomingNodes.length && !outgoingNodes.length) {
      const incomingPositions = incomingNodes.map(nodeId => (
        newElements[indexes.get(nodeId)].position
      ));
      const x = (
        Math.max(...incomingPositions.map(pos => pos.x)) + nodeWidth * 1.1
      );
      const y = averageYPosition(incomingPositions);
      newElements[i].position = { x, y };
    } else if (!incomingNodes.length && outgoingNodes.length) {
      const outgoingPositions = outgoingNodes.map(nodeId => (
        newElements[indexes.get(nodeId)].position
      ));
      const x = (
        Math.min(...outgoingPositions.map(pos => pos.x)) - nodeWidth * 0.5
      );
      const y = averageYPosition(outgoingPositions);
      newElements[i].position = { x, y };
    }
  }
  // Magic multipliers to compensate for unkown conditional node width

  return newElements;
}

const initialElements = demoFlow.elements;
const initialNodeData = newNodeData(initialElements);
const initialIndexes = newElemIndexes(initialElements);

const BASE_MODAL_CLS = "ModalDialog --transparent --display-none";
const MAX_UNDO_NUM = 20;

function App() {
  const [aboutCls, setAboutCls] = useState(BASE_MODAL_CLS);
  const [newFlowCls, setNewFlowCls] = useState(BASE_MODAL_CLS);
  const [openFileCls, setOpenFileCls] = useState(BASE_MODAL_CLS);
  const [addCourseCls, setAddCourseCls] = useState(BASE_MODAL_CLS);

  const flowInstance = useRef(null);
  const updateNodePos = useRef(null);
  const selectedElements = useRef(null);
  const setSelectedElements = useRef(null);
  const resetSelectedElements = useRef(null);
  const unsetNodesSelection = useRef(null);

  const [elements, setElements] = useState(initialElements);
  const nodeData = useRef(initialNodeData);
  const elemIndexes = useRef(initialIndexes);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const dragStartState = useRef(null);
  // Because drag start is triggered on mousedown even if no movement
  // occurs, the flow state at drag start should only be added to undo
  // history on drag end

  const [contextActive, setContextActive] = useState(false);
  const contextData = useRef({
    target: "",
    typeType: "node",
    targetStatus: "",
  });
  const [mouseXY, setMouseXY] = useState(ZERO_POSITION);

  const [controlsClosed, setControlsClosed] = useState(true);
  const openControlsButtonRef = useRef(null);
  // const closeControlsButtonRef = useRef(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  function onLoad(reactFlowInstance) {
    reactFlowInstance.fitView();
    flowInstance.current = reactFlowInstance;
  }

  function resetElementStates(newElements) {
    return newElements.map(elem => (
      isNode(elem)
        ? { ...elem, data: { ...elem.data, nodeConnected: false } }
        : { ...elem, animated: false }
    ));
  }

  function recalculatedElements(newElements) {
    nodeData.current = newNodeData(newElements);
    let recalculatedElems = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(recalculatedElems);
    recalculatedElems = updateAllNodes(
      recalculatedElems, nodeData.current, elemIndexes.current
    );
    return resetElementStates(recalculatedElems);
  }

  function recordFlowState(elems = null) {
    const flowElems = elems ?? flowInstance.current.toObject().elements;
    if (undoStack.current.length === MAX_UNDO_NUM) {
      undoStack.current.shift();
    }
    undoStack.current.push(resetElementStates(flowElems));
    redoStack.current = [];
  }

  useEffect(() => {
    function undoListener(event) {
      if (event.ctrlKey && event.key === "z") {
        if (undoStack.current.length) {
          redoStack.current.push(
            resetElementStates(flowInstance.current.toObject().elements)
          );
          const pastElements = undoStack.current.pop();
          for (const elem of pastElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({ id: elem.id, pos: elem.position });
            }
          }
          nodeData.current = newNodeData(pastElements);
          elemIndexes.current = newElemIndexes(pastElements);
          setElements(pastElements);
        }
      }
    }
    function redoListener(event) {
      if (event.ctrlKey && event.key === "y") {
        if (redoStack.current.length) {
          undoStack.current.push(
            resetElementStates(flowInstance.current.toObject().elements)
          );
          const futureElements = redoStack.current.pop();
          for (const elem of futureElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({ id: elem.id, pos: elem.position });
            }
          }
          nodeData.current = newNodeData(futureElements);
          elemIndexes.current = newElemIndexes(futureElements);
          setElements(futureElements);
        }
      }
    }
    document.addEventListener("keydown", undoListener);
    document.addEventListener("keydown", redoListener);
  }, []);

  function openDialog(setState) {
    if (!prefersReducedMotion) {
      setState("--transparent");
      setTimeout(() => {
        setState("");
      }, 25);
    } else {
      setState("");
    }
  }

  function closeDialog(setState) {
    if (!prefersReducedMotion) {
      setState("--transparent");
      setTimeout(() => {
        setState("--transparent --display-none");
      }, 100);
    } else {
      setState("--transparent --display-none");
    }
  }

  function generateNewFlow(elems) {
    recordFlowState();
    nodeData.current = newNodeData(elems);
    let newElements = sortElementsByDepth(elems.slice(), nodeData.current);
    elemIndexes.current = newElemIndexes(newElements);
    newElements = updateAllNodes(
      newElements, nodeData.current, elemIndexes.current
    );
    newElements = generateNewLayout(
      newElements, elemIndexes.current, nodeData.current
    );
    setElements(newElements);
  }

  function openFlow(openedElements) {
    recordFlowState();
    nodeData.current = newNodeData(openedElements);
    elemIndexes.current = newElemIndexes(openedElements);
    setElements(openedElements);
  }

  function saveFlow() {
    const downloadLink = document.createElement("a");
    const fileContents = {
      version: CURRENT_VERSION,
      elements: resetElementStates(flowInstance.current.toObject().elements),
    };
    const fileBlob = new Blob(
      [JSON.stringify(fileContents, null, 2)], { type: "application/json" }
    );
    downloadLink.href = URL.createObjectURL(fileBlob);
    downloadLink.download = "untitled-flow.json";
    downloadLink.click();
  }

  function autoconnect(newElements, targetNode, reposition = false) {
    const targetId = targetNode.id;
    const courseMatches = targetNode.data.prerequisite.match(COURSE_REGEX);
    const targetPrereqs = (
      courseMatches
        ? courseMatches.filter(elemId => elemIndexes.current.has(elemId))
          .filter(
            elemId => !elemIndexes.current.has(edgeArrowId(elemId, targetId))
          )
          .map(elemId => newElements[elemIndexes.current.get(elemId)])
        : []
    );
    const targetPostreqs = [];
    const numNodes = nodeData.current.size;
    for (let i = 0; i < numNodes; i++) {
      const postreq = newElements[i];
      if (postreq.type === "course"
          && postreq.data.prerequisite.includes(targetId)
          && !elemIndexes.current.has(edgeArrowId(targetId, postreq.id))) {
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

    if (!elemIndexes.current.has(targetId)) {
      newElements.push(targetNode);
    }

    return newElements;
  }

  function addCourseNode(newNode, connectToExisting, newCoursePosition) {
    recordFlowState();
    let newElems = flowInstance.current.toObject().elements;
    if (connectToExisting) {
      newElems = autoconnect(
        newElems, newNode, newCoursePosition === "relative"
      );
    } else {
      newElems = newElems.push(newNode);
    }
    setElements(recalculatedElements(newElems));
  }

  function reflowElements() {
    recordFlowState();
    const newElements = generateNewLayout(
      elements, elemIndexes.current, nodeData.current
    );
    setElements(newElements);
  }

  /* ELEMENT */
  // Single change can only propagate 2 layers deep
  function onElementClick(event, targetElem) {
    // NOTE: targetElem isn't the actual element so can't use id equality
    if (event.altKey && isNode(targetElem) && targetElem.type === "course") {
      resetSelectedElements.current();
      const nodeId = targetElem.id;
      const newElements = elements.slice();
      let newStatus;
      switch (elements[elemIndexes.current.get(nodeId)].data.nodeStatus) {
        case "ready":
          newStatus = "enrolled";
          break;
        case "enrolled":
          newStatus = "completed";
          break;
        default:
          return;
      }
      recordFlowState();
      setNodeStatus(
        nodeId, newStatus, newElements, nodeData.current, elemIndexes.current
      );

      const firstDiff = nodeData.current.get(nodeId).outgoingNodes;
      for (const id of firstDiff) {
        updateNodeStatus(
          id, newElements, nodeData.current, elemIndexes.current
        );
      }
      const secondDiff = new Set(
        firstDiff
          .map(id => nodeData.current.get(id).outgoingNodes)
          .flat()
      );
      for (const id of secondDiff.values()) {
        updateNodeStatus(
          id, newElements, nodeData.current, elemIndexes.current
        );
      }

      setElements(newElements);
    }
  }

  function onElementsRemove(targetElems) {
    recordFlowState();
    setElements(
      recalculatedElements(
        removeElements(targetElems, elements)
      )
    );
  }

  /* NODE */
  function onNodeDragStart(_event, _node) {
    dragStartState.current = flowInstance.current.toObject().elements;
    setContextActive(false);
  }

  function onNodeDragStop(_event, _node) {
    recordFlowState(dragStartState.current);
  }

  function applyHoverEffectBackward(nodeId, newElements) {
    for (const id of nodeData.current.get(nodeId).incomingEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i], animated: !prefersReducedMotion
      };
    }

    for (const id of nodeData.current.get(nodeId).incomingNodes) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: true },
      };

      if (["or", "and"].includes(newElements[i].type)) {
        applyHoverEffectBackward(id, newElements);
      }
    }
  }

  function applyHoverEffectForward(nodeId, newElements) {
    for (const id of nodeData.current.get(nodeId).outgoingEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i], animated: !prefersReducedMotion
      };
    }

    for (const id of nodeData.current.get(nodeId).outgoingNodes) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: true },
      };

      if (["or", "and"].includes(newElements[i].type)) {
        applyHoverEffectForward(id, newElements);
      }
    }
  }

  function onNodeMouseEnter(_event, targetNode) {
    const nodeId = targetNode.id;
    const newElements = elements.slice();

    applyHoverEffectBackward(nodeId, newElements);
    applyHoverEffectForward(nodeId, newElements);

    setElements(newElements);
  }

  function onNodeMouseLeave(_event, _targetNode) {
    const newElements = elements.slice();

    const numNodes = nodeData.current.size;
    const numElems = elemIndexes.current.size;
    for (let i = 0; i < numNodes; i++) {
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: false },
      };
    }
    for (let i = numNodes; i < numElems; i++) {
      newElements[i] = { ...newElements[i], animated: false };
    }

    setElements(newElements);
    // Can't target specific elements because of how slow this operation is
    // Using an old for loop for speed over Array.map()
  }

  function onNodeContextMenu(event, node) {
    event.preventDefault();
    unsetNodesSelection.current();
    const selectedIds = (
      selectedElements.current
        ? selectedElements.current.map(elem => elem.id)
        : []
    );
    if (selectedIds.includes(node.id)) {
      if (selectedIds.length === 1) {
        // Only one node selected
        contextData.current = {
          target: node.id,
          targetType: node.type === "course" ? "coursenode" : "conditionalnode",
          targetStatus: node.data.nodeStatus,
        };
      } else if (!selectedIds.some(elemId => elemId.includes("->"))) {
        // Multiple nodes selected
        const courseNodeSelected = (
          selectedIds.some(nodeId => (
            elements[elemIndexes.current.get(nodeId)].type === "course"
          ))
        );
        contextData.current = {
          target: selectedIds,
          targetType: (
            courseNodeSelected ? "coursemultiselect" : "conditionalmultiselect"
          ),
          targetStatus: "",
        };
      } else {
        // Mixed selection, includes edges
        contextData.current = {
          target: selectedIds,
          targetType: "mixedmultiselect",
          targetStatus: "",
        };
      }
    } else {
      setSelectedElements.current([node]);
      contextData.current = {
        target: node.id,
        targetType: node.type === "course" ? "coursenode" : "conditionalnode",
        targetStatus: node.data.nodeStatus,
      };
    }
    setMouseXY({ x: event.clientX, y: event.clientY });
    setContextActive(true);
  }

  /* EDGE */
  function onConnect({ source, target }) {
    const newEdgeId = edgeArrowId(source, target);
    const reverseEdgeId = edgeArrowId(target, source);
    // Creating a cycle causes infinite recursion in depth calculation
    if (!elemIndexes.current.has(newEdgeId)
        && !elemIndexes.current.has(reverseEdgeId)) {
      recordFlowState();
      const newElements = resetElementStates(elements);
      // Need to "unhover" to return to base state
      newElements.push({
        id: newEdgeId,
        source,
        target,
        className: elements[elemIndexes.current.get(source)].data.status,
        label: null,
      });
      setElements(recalculatedElements(newElements));
    }
  }

  function onConnectStart(_event, { _nodeId, _handleType }) {
    setContextActive(false);
  }

  function onEdgeUpdate(oldEdge, newConnection) {
    const newSource = newConnection.source;
    const newTarget = newConnection.target;
    const newEdgeId = edgeArrowId(newSource, newTarget);
    const reverseEdgeId = edgeArrowId(newTarget, newSource);
    if (!elemIndexes.current.has(newEdgeId)
        && !elemIndexes.current.has(reverseEdgeId)) {
      recordFlowState();
      setElements(prevElems => {
        const newElements = prevElems.slice();
        newElements[elemIndexes.current.get(oldEdge.id)] = {
          ...oldEdge, // Keep CC status
          id: newEdgeId,
          source: newConnection.source,
          target: newConnection.target,
          className: prevElems[elemIndexes.current.get(newSource)].data.status,
        };
        return recalculatedElements(newElements);
      });
      // Need to use functional update here for some reason
    }
  }

  function onEdgeContextMenu(event, edge) {
    event.preventDefault();
    unsetNodesSelection.current();
    const selectedIds = (
      selectedElements.current
        ? selectedElements.current.map(elem => elem.id)
        : []
    );
    if (selectedIds.includes(edge.id)) {
      if (selectedIds.length === 1) {
        contextData.current = {
          target: edge.id,
          targetType: "edge",
          targetStatus: elements[elemIndexes.current.get(edge.id)].label,
        };
      } else {
        contextData.current = {
          target: selectedIds,
          targetType: "mixedmultiselect",
          targetStatus: "",
        };
      }
    } else {
      setSelectedElements.current([edge]);
      contextData.current = {
        target: edge.id,
        targetType: "edge",
        targetStatus: elements[elemIndexes.current.get(edge.id)].label,
      };
    }
    setMouseXY({ x: event.clientX, y: event.clientY });
    setContextActive(true);
  }

  /* MOVE */
  function onMoveStart(_flowTransform) {
    setContextActive(false);
  }

  /* SELECTION */
  function onSelectionDragStart(_event, _nodes) {
    dragStartState.current = flowInstance.current.toObject().elements;
  }

  function onSelectionDragStop(_event, _nodes) {
    recordFlowState(dragStartState.current);
  }

  function onSelectionContextMenu(event, nodes) {
    event.preventDefault();
    const courseNodeSelected = (
      nodes.some(node => (
        elements[elemIndexes.current.get(node.id)].type === "course"
      ))
    );
    contextData.current = {
      target: nodes.map(n => n.id),
      targetType: (
        courseNodeSelected ? "courseselection" : "conditionalselection"
      ),
      targetStatus: "",
    };
    setMouseXY({ x: event.clientX, y: event.clientY });
    setContextActive(true);
  }

  /* PANE */
  // function onPaneClick(_event) {
  //   setContextActive(false);
  // }

  function onPaneContextMenu(event) {
    event.preventDefault();
    resetSelectedElements.current();
    unsetNodesSelection.current();
    contextData.current = {
      target: "",
      targetType: "pane",
      targetStatus: "",
    };
    setMouseXY({ x: event.clientX, y: event.clientY });
    setContextActive(true);
  }

  function HeaderButton({ label, description, onClick }) {
    return (
      <Tippy
        content={description}
        trigger="mouseenter"
        hideOnClick="true"
        placement="bottom"
        duration={prefersReducedMotion ? 0 : 100}
      >
        <button type="button" onClick={onClick}>
          {label}
        </button>
      </Tippy>
    );
  }
  HeaderButton.propTypes = {
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="App"
      onClick={() => setContextActive(false)}
      onWheel={() => setContextActive(false)}
    >
      <Header version={CURRENT_VERSION}>
        <HeaderButton
          label="New flow"
          description="Start a new flow"
          onClick={() => openDialog(setNewFlowCls)}
        />
        <HeaderButton
          label="Open"
          description="Open an existing flow"
          onClick={() => openDialog(setOpenFileCls)}
        />
        <HeaderButton
          label="Save"
          description="Save current flow to file"
          onClick={saveFlow}
        />
        <HeaderButton
          label="Add course"
          description="Add courses to flow"
          onClick={() => openDialog(setAddCourseCls)}
        />
        <HeaderButton
          label="Reflow"
          description="Generate a new layout"
          onClick={reflowElements}
        />
        <HeaderButton
          label="About"
          description="About Prereq Flow"
          onClick={() => openDialog(setAboutCls)}
        />
      </Header>
      <ReactFlowProvider>
        <FlowStoreLifter
          updateNodePos={updateNodePos}
          selectedElements={selectedElements}
          setSelectedElements={setSelectedElements}
          resetSelectedElements={resetSelectedElements}
          unsetNodesSelection={unsetNodesSelection}
        />
        <ReactFlow
          // Flow View
          minZoom={0.25}
          // Instance
          onLoad={onLoad}
          // Basic Props
          elements={elements}
          nodeTypes={{
            course: CourseNode,
            or: OrNode,
            and: AndNode,
          }}
          // Event Handlers
          // --- Element ---
          onElementClick={onElementClick}
          onElementsRemove={onElementsRemove}
          // --- Node ---
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeContextMenu={onNodeContextMenu}
          // --- Edge ---
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeContextMenu={onEdgeContextMenu}
          // --- Move ---
          onMoveStart={onMoveStart}
          // --- Selection ---
          onSelectionDragStart={onSelectionDragStart}
          onSelectionDragStop={onSelectionDragStop}
          onSelectionContextMenu={onSelectionContextMenu}
          // --- Pane ---
          // onPaneClick={onPaneClick}
          onPaneContextMenu={onPaneContextMenu}
          // Interaction
          selectNodesOnDrag={false}
          zoomOnDoubleClick={false}
          // Keys
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Control"
        >
          <Background variant="lines" />
          <Controls showInteractive={false} />
        </ReactFlow>
        <ContextMenu
          active={contextActive}
          data={contextData.current}
          xy={mouseXY}
          COURSE_STATUS_CODES={COURSE_STATUS_CODES}
          setSelectionStatuses={(nodeIds, newStatus) => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = elements.slice();
            for (const id of nodeIds) {
              if (elements[elemIndexes.current.get(id)].type === "course") {
                setNodeStatus(
                  id, newStatus, newElements,
                  nodeData.current, elemIndexes.current
                );
              }
            }

            setElements(
              updateAllNodes(newElements, nodeData.current, elemIndexes.current)
            );
          }}
          toggleEdgeConcurrency={edgeId => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = elements.slice();
            const i = elemIndexes.current.get(edgeId);
            const targetEdge = newElements[i];

            if (targetEdge.label) {
              newElements[i] = {
                id: edgeId,
                source: targetEdge.source,
                target: targetEdge.target,
                className: targetEdge.className,
                label: null,
              };
            } else {
              newElements[i] = { ...targetEdge, ...CONCURRENT_LABEL };
            }

            setElements(
              updateAllNodes(newElements, nodeData.current, elemIndexes.current)
            );
          }}
          deleteElems={elemIds => {
            resetSelectedElements.current();
            onElementsRemove(
              elemIds.map(id => elements[elemIndexes.current.get(id)])
            );
          }}
          connectAll={targetId => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = autoconnect(
              elements.slice(), elements[elemIndexes.current.get(targetId)]
            );
            setElements(recalculatedElements(newElements));
          }}
          disconnectAll={targetIds => {
            resetSelectedElements.current();
            recordFlowState();

            const connectedEdges = new Set();
            for (const id of targetIds) {
              for (const edge of nodeData.current.get(id).connectedEdges) {
                connectedEdges.add(edge);
              }
            }

            setElements(
              recalculatedElements(
                elements.filter(elem => !connectedEdges.has(elem.id))
              )
            );
          }}
          newConditionalNode={(type, xy) => {
            resetSelectedElements.current();
            recordFlowState();

            const newNode = newConditionalNode(
              type, flowInstance.current.project(xy)
            );

            setElements(
              recalculatedElements(elements.concat([newNode]))
            );
          }}
          reroute={targetId => {
            resetSelectedElements.current();
            recordFlowState();

            let newElements = elements.slice();

            const targetNode = newElements[elemIndexes.current.get(targetId)];
            const targetData = nodeData.current.get(targetId);

            for (const iNode of targetData.incomingNodes) {
              for (const oNode of targetData.outgoingNodes) {
                const oldEdgeId = edgeArrowId(iNode, targetId);
                const newEdgeId = edgeArrowId(iNode, oNode);
                if (!nodeData.current.has(newEdgeId)) {
                  newElements.push({
                    ...newElements[elemIndexes.current.get(oldEdgeId)],
                    id: newEdgeId,
                    source: iNode,
                    target: oNode,
                  });
                }
              }
            }
            newElements = removeElements([targetNode], newElements);
            setElements(recalculatedElements(newElements));
          }}
        />
      </ReactFlowProvider>
      <aside className="Legend">
        <div className="completed">Completed</div>
        <div className="enrolled">Enrolled</div>
        <div className="ready">Ready</div>
        <div className="under-one-away">&lt;1&nbsp;away</div>
        <div className="one-away">1&nbsp;away</div>
        <div className="over-one-away">&gt;1&nbsp;away</div>
      </aside>
      <button
        ref={openControlsButtonRef}
        type="button"
        className="Controls__open-btn"
        onClick={() => setControlsClosed(!controlsClosed)}
        // Focusing on close button causes offscreen jerk
      >
        <img src="dist/icons/question.svg" alt="Open controls" />
      </button>
      <aside
        className={classNames(
          "Controls__content", { "Controls__content--closed": controlsClosed }
        )}
      >
        <ul>
          <li>Click for single&nbsp;select</li>
          <li>Right click for context&nbsp;menus</li>
          <li>Hover over a node for connections and course info (click to hide&nbsp;tooltip)</li>
          <li>Drag to create a new edge from a node when crosshair icon&nbsp;appears</li>
          <li>Drag to reconnect an edge when 4-way arrow icon&nbsp;appears</li>
          <li><kbd>Alt</kbd> + click to advance course&nbsp;status</li>
          <li><kbd>Ctrl</kbd> + click for multiple&nbsp;select</li>
          <li><kbd>Shift</kbd> + drag for area&nbsp;select</li>
          <li><kbd>Del</kbd> to delete selected&nbsp;elements</li>
          <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo (max&nbsp;20)</li>
          <li><kbd>Ctrl</kbd> + <kbd>Y</kbd> to&nbsp;redo</li>
          <button
            // ref={closeControlsButtonRef}
            type="button"
            className="Controls__close-btn"
            onClick={() => {
              setControlsClosed(true);
              openControlsButtonRef.current.focus();
            }}
            tabIndex={controlsClosed ? "-1" : "0"}
          >
            <img src="dist/icons/chevron-right.svg" alt="Close controls" />
          </button>
        </ul>
      </aside>

      <AboutDialog
        modalCls={aboutCls}
        closeDialog={() => closeDialog(setAboutCls)}
      />
      <NewFlowDialog
        modalCls={newFlowCls}
        closeDialog={() => closeDialog(setNewFlowCls)}
        generateNewFlow={generateNewFlow}
      />
      <OpenFileDialog
        modalCls={openFileCls}
        closeDialog={() => closeDialog(setOpenFileCls)}
        openFlow={openFlow}
      />
      <AddCourseDialog
        modalCls={addCourseCls}
        closeDialog={() => closeDialog(setAddCourseCls)}
        nodeData={nodeData.current}
        addCourseNode={addCourseNode}
      />
    </div>
  );
}

export default App;
