import React, {
  useState,
  useEffect,
  useRef,
  // useCallback,
} from "react";
// eslint-disable-next-line import/no-duplicates
import ReactFlow from "react-flow-renderer"; // FIXME: Default import error
import {
// import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  isNode,
  isEdge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
// eslint-disable-next-line import/no-duplicates
} from "react-flow-renderer";
import dagre from "dagre";

import ContextMenu from "./ContextMenu.jsx";
import AboutDialog from "./AboutDialog.jsx";
import NewFlowDialog from "./NewFlowDialog.jsx";
import OpenFileDialog from "./OpenFileDialog.jsx";
import AddCourseDialog from "./AddCourseDialog.jsx";
import CustomNode from "./CustomNode.jsx";

import usePrefersReducedMotion from "./usePrefersReducedMotion.jsx";

import { edgeArrowId, CONCURRENT_LABEL } from "./data/parse-courses.js";

import demoFlow from "./data/demo-flow-v2.json";

import "./App.scss";

const nodeWidth = 172;
const nodeHeight = 36;

function generateDagreLayout(elements) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 150 });

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

const COURSE_STATUS_CODES = Object.freeze({
  completed: 0,
  enrolled: 1,
  ready: 2,
  "under-one-away": 3,
  "one-away": 4,
  "over-one-away": 5,
});

function setnodeStatus(nodeId, newStatus, elements, nodeData, elemIndexes) {
  elements[elemIndexes.get(nodeId)].data.nodeStatus = newStatus;
  for (const edgeId of nodeData.get(nodeId).outgoingEdges) {
    elements[elemIndexes.get(edgeId)] = {
      ...elements[elemIndexes.get(edgeId)], className: newStatus
    };
  }
}

function updateNodeStatus(nodeId, elements, nodeData, elemIndexes) {
  const currentStatus = elements[elemIndexes.get(nodeId)].data.nodeStatus;
  const incomingEdges = nodeData.get(nodeId).incomingEdges.map(id => (
    elements[elemIndexes.get(id)]
  ));

  let newStatusCode = Math.max(...incomingEdges.map(edge => {
    let edgeStatusCode = COURSE_STATUS_CODES[edge.className];
    if (edgeStatusCode === COURSE_STATUS_CODES.enrolled
        && edge.label === "CC") {
      edgeStatusCode = COURSE_STATUS_CODES.completed;
    }
    return edgeStatusCode;
  }));
  newStatusCode = (
    newStatusCode === Number.NEGATIVE_INFINITY ? 0 : newStatusCode
  );
  // Math.max() with no args -> negative infinity

  let newStatus;
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

  setnodeStatus(nodeId, newStatus, elements, nodeData, elemIndexes);
}

function updateAllNodes(elements, nodeData, elemIndexes) {
  const updatedElements = elements.slice();
  const numNodes = nodeData.size;
  for (let i = 0; i < numNodes; i++) {
    updateNodeStatus(elements[i].id, updatedElements, nodeData, elemIndexes);
  }
  return updatedElements;
}

const initialElements = demoFlow.elements;
const initialNodeData = new Map(Object.entries(demoFlow.nodeData));
const initialIndexes = newElemIndexes(initialElements);

const BASE_MODAL_CLS = "ModalDialog --transparent --display-none";
const MAX_UNDO_NUM = 20;

function App() {
  const [aboutCls, setAboutCls] = useState(BASE_MODAL_CLS);
  const [newFlowCls, setNewFlowCls] = useState(BASE_MODAL_CLS);
  const [openFileCls, setOpenFileCls] = useState(BASE_MODAL_CLS);
  const [addCourseCls, setAddCourseCls] = useState(BASE_MODAL_CLS);

  const flowInstance = useRef(null);
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
  const mouseXY = useRef([0, 0]);

  const [controlsClosed, setControlsClosed] = useState(true);

  const prefersReducedMotion = usePrefersReducedMotion();

  function onLoad(reactFlowInstance) {
    reactFlowInstance.fitView();
    flowInstance.current = reactFlowInstance;
  }

  function resetElementStates(newElements) {
    const numNodes = nodeData.current.size;
    const numElems = elemIndexes.current.size;
    for (let i = 0; i < numNodes; i++) {
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: false }
      };
    }
    for (let i = numNodes; i < numElems; i++) {
      newElements[i] = { ...newElements[i], animated: false, style: {} };
    }

    return newElements;
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
      setState("ModalDialog --transparent");
      setTimeout(() => {
        setState("ModalDialog");
      }, 25);
    } else {
      setState("ModalDialog");
    }
  }

  function closeDialog(setState) {
    if (!prefersReducedMotion) {
      setState("ModalDialog --transparent");
      setTimeout(() => {
        setState("ModalDialog --transparent --display-none");
      }, 100);
    } else {
      setState("ModalDialog --transparent --display-none");
    }
  }

  function openFlow(openedElements, openedNodeData) {
    recordFlowState();
    nodeData.current = openedNodeData;
    elemIndexes.current = newElemIndexes(openedElements);
    setElements(openedElements);
  }

  function saveFlow() {
    const downloadLink = document.createElement("a");
    const fileContents = {
      elements, nodeData: Object.fromEntries(nodeData.current)
    };
    const fileBlob = new Blob(
      [JSON.stringify(fileContents, null, 2)], { type: "application/json" }
    );
    downloadLink.href = URL.createObjectURL(fileBlob);
    downloadLink.download = "prereq-flow.json";
    downloadLink.click();
  }

  function generateNewFlow(elems) {
    recordFlowState();
    let newElements = generateDagreLayout(elems);
    nodeData.current = newNodeData(newElements);
    newElements = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(newElements);
    newElements = updateAllNodes(
      newElements, nodeData.current, elemIndexes.current
    );
    setElements(newElements);
  }

  function recalculateElements(newElements) {
    nodeData.current = newNodeData(newElements);
    let recalculatedElems = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(recalculatedElems);
    recalculatedElems = updateAllNodes(
      recalculatedElems, nodeData.current, elemIndexes.current
    );
    setElements(recalculatedElems);
  }

  function addCourseNode(newNode) {
    recordFlowState();
    recalculateElements(elements.slice().concat([newNode]));
  }

  function reflowElements() {
    recordFlowState();
    // https://flaviocopes.com/how-to-shuffle-array-javascript/
    let newElements = generateDagreLayout(
      elements.sort(() => Math.random() - 0.5)
    );
    newElements = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(newElements);

    setElements(newElements);
  }

  /* ELEMENT */
  // Single change can only propogate 2 layers deep
  function onElementClick(event, targetElem) {
    // NOTE: targetElem isn't the actual element so can't use id equality
    if (event.altKey && isNode(targetElem)) {
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
      setnodeStatus(
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
    recalculateElements(removeElements(targetElems, elements));
  }

  /* NODE */
  function onNodeDragStart(_event, _node) {
    dragStartState.current = flowInstance.current.toObject().elements;
    setContextActive(false);
  }

  function onNodeDragStop(_event, node) {
    recordFlowState(dragStartState.current);
    const newElements = elements.slice();
    newElements[elemIndexes.current.get(node.id)].position = node.position;
    setElements(newElements);
  }

  function onNodeMouseEnter(_event, targetNode) {
    const nodeId = targetNode.id;
    const newElements = elements.slice();

    for (const id of nodeData.current.get(nodeId).connectedEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        animated: !prefersReducedMotion,
        style: { strokeWidth: "4px" },
      };
    }

    for (const id of nodeData.current.get(nodeId).connectedNodes) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: true },
      };
    }
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
      newElements[i] = { ...newElements[i], animated: false, style: {} };
    }

    setElements(newElements);
    // Can't target specific elements because of how slow this operation is
    // Using an old for loop for speed over Array.map()
  }

  function onNodeContextMenu(event, node) {
    event.preventDefault();
    contextData.current = {
      target: node.id,
      targetType: "node",
      targetStatus: node.data.nodeStatus,
    };
    mouseXY.current = [event.clientX, event.clientY];
    setContextActive(true);
  }

  /* EDGE */
  function onConnect({ source, target }) {
    const newEdgeId = edgeArrowId(source, target);
    if (!elemIndexes.current.has(newEdgeId)) {
      recordFlowState();
      const newElements = elements.map(elem => {
        if (isNode(elem)) {
          return { ...elem, data: { ...elem.data, nodeConnected: false } };
        } else {
          return { ...elem, animated: false, style: {} };
        }
      });
      // Need to "unhover" to return to base state
      newElements.push({
        id: newEdgeId,
        source,
        target,
        className: elements[elemIndexes.current.get(source)].data.status,
        label: null,
      });
      recalculateElements(newElements);
    }
  }

  function onConnectStart(_event, { _nodeId, _handleType }) {
    setContextActive(false);
  }

  function onEdgeUpdate(oldEdge, newConnection) {
    const newSource = newConnection.source;
    const newTarget = newConnection.target;
    const newEdgeId = edgeArrowId(newSource, newTarget);
    if (!elemIndexes.current.has(newEdgeId)) {
      recordFlowState();
      const newElements = elements.slice();
      newElements[elemIndexes.current.get(oldEdge.id)] = {
        ...oldEdge, // Keep CC status
        id: newEdgeId,
        source: newConnection.source,
        target: newConnection.target,
        className: elements[elemIndexes.current.get(newSource)].data.status,
      };
      recalculateElements(newElements);
    }
  }

  function onEdgeContextMenu(event, edge) {
    event.preventDefault();
    contextData.current = {
      target: edge.id,
      targetType: "edge",
      targetStatus: elements[elemIndexes.current.get(edge.id)].label,
    };
    mouseXY.current = [event.clientX, event.clientY];
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

  function onSelectionDragStop(_event, nodes) {
    recordFlowState(dragStartState.current);
    const newElements = elements.slice();
    for (const node of nodes) {
      newElements[elemIndexes.current.get(node.id)].position = node.position;
    }
    setElements(newElements);
  }

  function onSelectionContextMenu(event, nodes) {
    event.preventDefault();
    contextData.current = {
      target: nodes.map(n => n.id),
      targetType: "selection",
      targetStatus: "",
    };
    mouseXY.current = [event.clientX, event.clientY];
    setContextActive(true);
  }

  /* PANE */
  // function onPaneClick(_event) {
  //   setContextActive(false);
  // }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="App" onClick={() => setContextActive(false)}>
      <header className="header">
        <h1>Prereq Flow</h1>
        <div className="header__buttons">
          <button type="button" onClick={() => openDialog(setNewFlowCls)}>
            New flow
          </button>
          <button type="button" onClick={() => openDialog(setOpenFileCls)}>
            Open
          </button>
          <button type="button" onClick={saveFlow}>
            Save
          </button>
          <button type="button" onClick={() => openDialog(setAddCourseCls)}>
            Add course
          </button>
          <button type="button" onClick={reflowElements}>
            Reflow
          </button>
          <button type="button" onClick={() => openDialog(setAboutCls)}>
            About
          </button>
        </div>
        <small className="header__version">Beta</small>
      </header>
      <ReactFlowProvider>
        <ReactFlow
          // Instance
          onLoad={onLoad}
          // Basic Props
          elements={elements}
          nodeTypes={{ custom: CustomNode }}
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
          // Interaction
          selectNodesOnDrag={false}
          zoomOnDoubleClick={false}
          // Keys
          deleteKeyCode="Delete"
          // multiSelectionKeyCode="Control"
          // Going to disable multiclick selection for now,
          // doesn't go well with recording node movements
        >
          <Background variant="lines" />
          <Controls showInteractive={false} />
        </ReactFlow>
        <ContextMenu
          active={contextActive}
          data={contextData.current}
          xy={mouseXY.current}
          COURSE_STATUS_CODES={COURSE_STATUS_CODES}
          setSelectionStatuses={(nodeIds, newStatus) => {
            recordFlowState();
            const newElements = elements.slice();
            for (const id of nodeIds) {
              setnodeStatus(
                id, newStatus, newElements, nodeData.current, elemIndexes.current
              );
            }
            setElements(
              updateAllNodes(newElements, nodeData.current, elemIndexes.current)
            );
          }}
          toggleEdgeConcurrency={edgeId => {
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
            recordFlowState();
            recalculateElements(
              removeElements(
                elemIds.map(id => elements[elemIndexes.current.get(id)]), elements
              )
            );
          }}
        />
      </ReactFlowProvider>
      <div className="legend">
        <div className="completed">Completed</div>
        <div className="enrolled">Enrolled</div>
        <div className="ready">Ready</div>
        <div className="under-one-away">&lt;1&nbsp;away</div>
        <div className="one-away">1&nbsp;away</div>
        <div className="over-one-away">&gt;1&nbsp;away</div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className="display-controls"
        onClick={() => setControlsClosed(false)}
      >
        <img src="dist/icons/question.svg" alt="Open controls" />
      </button>
      <ul className={`controls-help${controlsClosed ? " closed" : ""}`}>
        <li>Click for single&nbsp;select</li>
        <li>Right click for context&nbsp;menu</li>
        <li>Hover over a node for connections and course info (click to hide&nbsp;tooltip)</li>
        <li>Drag to create a new edge from a node when crosshair icon&nbsp;appears</li>
        <li>Drag to reconnect an edge when 4-way arrow icon&nbsp;appears</li>
        <li><kbd>Alt</kbd> + click to advance course&nbsp;status</li>
        {/* <li><kbd>Ctrl</kbd> + click for multiple select</li> */}
        <li><kbd>Shift</kbd> + drag for area&nbsp;select</li>
        <li><kbd>Del</kbd> to delete selected&nbsp;elements</li>
        <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo (max&nbsp;10)</li>
        <li><kbd>Ctrl</kbd> + <kbd>Y</kbd> to&nbsp;redo</li>
        <button
          type="button"
          className="close-controls"
          onClick={() => setControlsClosed(true)}
        >
          <img src="dist/icons/chevron-right.svg" alt="Close controls" />
        </button>
      </ul>

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
