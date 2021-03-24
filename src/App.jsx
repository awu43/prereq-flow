import React, { useState, useRef } from "react";
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
import AddCourseDialog from "./AddCourseDialog.jsx";

import { CONCURRENT_LABEL, demoElements } from "./data/parse-courses.js";

// import initialElements from "./initial-elements.js";

import "./App.scss";

const nodeWidth = 172;
const nodeHeight = 36;

function generateDagreLayout(elements) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", ranksep: 75 });

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
      elem.targetPosition = "left";
      elem.sourcePosition = "right";

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
      status: "over-one-away",
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
  const data = nodeData.get(nodeId);
  data.status = newStatus;
  for (const id of [nodeId, ...data.outgoingEdges]) {
    elements[elemIndexes.get(id)] = {
      ...elements[elemIndexes.get(id)], className: newStatus
    };
  }
}

function updateNodeStatus(nodeId, elements, nodeData, elemIndexes) {
  const data = nodeData.get(nodeId);
  const currentStatus = data.status;
  const incomingEdges = data.incomingEdges.map(id => (
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
  for (const nodeId of nodeData.keys()) {
    updateNodeStatus(nodeId, updatedElements, nodeData, elemIndexes);
  }
  return updatedElements;
}

// const arrangedElements = generateDagreLayout(initialElements);
const arrangedElements = generateDagreLayout(demoElements);
const initialNodeData = newNodeData(arrangedElements);
const sortedElements = sortElementsByDepth(arrangedElements, initialNodeData);
const initialIndexes = newElemIndexes(sortedElements);
const initialElements = updateAllNodes(
  sortedElements, initialNodeData, initialIndexes
);

function onLoad(reactFlowInstance) {
  reactFlowInstance.fitView();
}

function App() {
  const [elements, setElements] = useState(initialElements);
  const nodeData = useRef(initialNodeData);
  const elemIndexes = useRef(initialIndexes);

  const [contextActive, setContextActive] = useState(false);
  const [contextType, setContextType] = useState("node");
  const [contextTarget, setContextTarget] = useState("");
  const [mouseXY, setMouseXY] = useState([0, 0]);

  const [controlsClosed, setControlsClosed] = useState(true);

  const [aboutCls, setAboutCls] = useState(
    "ModalDialog --transparent --display-none"
  );
  const [newFlowCls, setNewFlowCls] = useState(
    "ModalDialog --transparent --display-none"
  );
  const [addCourseCls, setAddCourseCls] = useState(
    "ModalDialog --transparent --display-none"
  );

  function openDialog(setState) {
    setState("ModalDialog --transparent");
    setTimeout(() => {
      setState("ModalDialog");
    }, 0);
  }

  function closeDialog(setState) {
    setState("ModalDialog --transparent");
    setTimeout(() => {
      setState("ModalDialog --transparent --display-none");
    }, 100);
  }

  function generateNewFlow(elems) {
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

  function reflowElements() {
    // https://flaviocopes.com/how-to-shuffle-array-javascript/
    let newElements = generateDagreLayout(
      elements.sort(() => Math.random() - 0.5)
    );
    newElements = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(newElements);

    setElements(newElements);
  }

  // Single change can only propogate 2 layers deep
  function onElementClick(event, targetElem) {
    // NOTE: targetElem isn't the actual element so can't use id equality
    if (event.altKey && isNode(targetElem)) {
      const nodeId = targetElem.id;
      const newElements = elements.slice();
      let newStatus;
      switch (nodeData.current.get(nodeId).status) {
        case "ready":
          newStatus = "enrolled";
          break;
        case "enrolled":
          newStatus = "completed";
          break;
        default:
          return;
      }
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
    recalculateElements(removeElements(targetElems, elements));
  }

  function onNodeDragStart(_event, _node) {
    setContextActive(false);
  }

  function onNodeMouseEnter(_event, targetNode) {
    const nodeId = targetNode.id;
    const newElements = elements.slice();

    for (const id of nodeData.current.get(nodeId).connectedEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i], animated: true, style: { strokeWidth: "4px" }
      };
    }

    for (const id of nodeData.current.get(nodeId).connectedNodes) {
      const i = elemIndexes.current.get(id);
      const currentStatus = nodeData.current.get(id).status;
      newElements[i] = {
        ...newElements[i], className: `${currentStatus} connected`,
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
        className: nodeData.current.get(newElements[i].id).status,
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
    setContextTarget(node.id);
    setContextType("node");
    setMouseXY([event.clientX, event.clientY]);
    setContextActive(true);
  }

  function onConnect({ source, target }) {
    const newElements = elements.map(elem => {
      if (isNode(elem)) {
        const currentStatus = nodeData.current.get(elem.id).status;
        return { ...elem, className: currentStatus };
      } else {
        return { ...elem, animated: false, style: {} };
      }
    });
    // Need to "unhover" to return to base state
    newElements.push({
      id: `${source} -> ${target}`,
      source,
      target,
      className: "over-one-away",
    });
    recalculateElements(newElements);
  }

  function onConnectStart(_event, { _nodeId, _handleType }) {
    setContextActive(false);
  }

  function onEdgeContextMenu(event, edge) {
    event.preventDefault();
    setContextTarget(edge.id);
    setContextType("edge");
    setMouseXY([event.clientX, event.clientY]);
    setContextActive(true);
  }

  function onSelectionContextMenu(event, nodes) {
    event.preventDefault();
    setContextTarget(nodes.map(n => n.id));
    setContextType("selection");
    setMouseXY([event.clientX, event.clientY]);
    setContextActive(true);
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="App" onClick={() => setContextActive(false)}>
      <header className="header">
        <h1>Prereq Flow</h1>
        <div className="header__buttons">
          <button type="button" onClick={() => openDialog(setAboutCls)}>
            About
          </button>
          <button type="button" onClick={() => openDialog(setNewFlowCls)}>
            New Flow
          </button>
          <button type="button" onClick={() => openDialog(setAddCourseCls)}>
            Add course
          </button>
          <button type="button" onClick={reflowElements}>
            Reflow
          </button>
        </div>
      </header>
      <ReactFlowProvider>
        <ReactFlow
          // Instance
          onLoad={onLoad}
          // Basic Props
          elements={elements}
          // Event Handlers
          onElementClick={onElementClick}
          onElementsRemove={onElementsRemove}
          onNodeDragStart={onNodeDragStart}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onNodeContextMenu={onNodeContextMenu}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          // TODO: onEdgeUpdate
          onEdgeContextMenu={onEdgeContextMenu}
          onSelectionContextMenu={onSelectionContextMenu}
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
      </ReactFlowProvider>
      <div className="legend">
        <div className="completed">Completed</div>
        <div className="enrolled">Enrolled</div>
        <div className="ready">Ready</div>
        <div className="under-one-away">&lt;1 away</div>
        <div className="one-away">1 away</div>
        <div className="over-one-away">&gt;1 away</div>
      </div>
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className="display-controls"
        onClick={() => setControlsClosed(false)}
      >
        <img src="dist/question.svg" alt="Open controls" />
      </button>
      <ul className={`controls-help${controlsClosed ? " closed" : ""}`}>
        <li>Right click elements for context menu</li>
        <li><kbd>Alt</kbd> + click to advance course status</li>
        <li><kbd>Shift</kbd> + drag for area select</li>
        <li><kbd>Ctrl</kbd> + click for multiple select</li>
        <button
          type="button"
          className="close-controls"
          onClick={() => setControlsClosed(true)}
        >
          <img src="dist/chevron-right.svg" alt="Close controls" />
        </button>
      </ul>

      <ContextMenu
        active={contextActive}
        type={contextType}
        xy={mouseXY}
        target={contextTarget}
        setNodeStatuses={(nodeIds, newStatus) => {
          for (const id of nodeIds) {
            setnodeStatus(
              id, newStatus, elements, nodeData.current, elemIndexes.current
            );
          }
          setElements(
            updateAllNodes(elements, nodeData.current, elemIndexes.current)
          );
        }}
        toggleEdgeCon={edgeId => {
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
          recalculateElements(
            removeElements(
              elemIds.map(id => elements[elemIndexes.current.get(id)]), elements
            )
          );
        }}
      />

      <AboutDialog
        modalCls={aboutCls}
        closeDialog={() => closeDialog(setAboutCls)}
      />
      <NewFlowDialog
        modalCls={newFlowCls}
        closeDialog={() => closeDialog(setNewFlowCls)}
        generateNewFlow={generateNewFlow}
      />
      <AddCourseDialog
        modalCls={addCourseCls}
        closeDialog={() => closeDialog(setAddCourseCls)}
      />
    </div>
  );
}

export default App;
