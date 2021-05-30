import React, { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  isNode,
  removeElements,
} from "react-flow-renderer";

import "./App.scss";

import type {
  XYPosition,
  NodeId,
  CourseNode,
  Node,
  Edge,
  Element,
  NodeDataMap,
  ElemIndexMap,
  NewCoursePosition,
  ContextTarget
} from "types/main";

import usePrefersReducedMotion from "./usePrefersReducedMotion";
import useDialogStatus from "./useDialogStatus";

import Header from "./components/Header";
import HeaderButton from "./components/HeaderButton";
import FlowInternalLifter from "./components/FlowInternalLifter";
import { default as CourseNodeComponent } from "./components/CourseNode";
import OrNode from "./components/OrNode";
import AndNode from "./components/AndNode";
import ContextMenu from "./components/ContextMenu";
import UserControls from "./components/UserControls";

import NewFlowDialog from "./components/dialogs/NewFlowDialog";
import OpenFileDialog, {
  CURRENT_VERSION
} from "./components/dialogs/OpenFileDialog";
import AddCourseDialog from "./components/dialogs/AddCourseDialog";
import AboutDialog from "./components/dialogs/AboutDialog";

import {
  ZERO_POSITION,
  newConditionalNode,
  edgeArrowId,
  CONCURRENT_LABEL,
  newNodeData,
  sortElementsByDepth,
  newElemIndexes,
  setNodeStatus,
  updateNodeStatus,
  updateAllNodes,
  generateNewLayout,
  resetElementStates,
  autoconnect,
} from "./utils";
import demoFlow from "./data/demo-flow.json";

const initialElements = demoFlow.elements as Element[];
const initialNodeData = newNodeData(initialElements);
const initialIndexes = newElemIndexes(initialElements);

const MAX_UNDO_NUM = 20;

export default function App() {
  const [newFlowDlgCls, openNewFlowDlg, closeNewFlowDlg] = useDialogStatus();
  const [openFileDlgCls, openOpenFileDlg, closeOpenFileDlg] = useDialogStatus();
  const [
    addCourseDlgCls, openAddCourseDlg, closeAddCourseDlg
  ] = useDialogStatus();
  const [aboutDlgCls, openAboutDlg, closeAboutDlg] = useDialogStatus();

  const flowInstance = useRef(null);
  const updateNodePos = useRef(null);
  const selectedElements = useRef(null);
  const setSelectedElements = useRef(null);
  const resetSelectedElements = useRef(null);
  const unsetNodesSelection = useRef(null);

  const [elements, setElements] = useState<Element[]>(initialElements);
  const nodeData = useRef<NodeDataMap>(initialNodeData);
  const elemIndexes = useRef<ElemIndexMap>(initialIndexes);
  const undoStack = useRef<(Element[])[]>([]);
  const redoStack = useRef<(Element[])[]>([]);
  const dragStartState = useRef<Element[]>(null);
  // Because drag start is triggered on mousedown even if no movement
  // occurs, the flow state at drag start should only be added to undo
  // history on drag end

  const [contextActive, setContextActive] = useState(false);
  const contextData = useRef<ContextTarget>({
    target: "",
    targetType: "node",
    targetStatus: "",
  });
  const [mouseXY, setMouseXY] = useState<XYPosition>(ZERO_POSITION);

  const prefersReducedMotion = usePrefersReducedMotion();

  function onLoad(reactFlowInstance) {
    reactFlowInstance.fitView();
    flowInstance.current = reactFlowInstance;
  }

  function recalculatedElements(newElements: Element[]) {
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
    function undoListener(event: KeyboardEvent) {
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
    function redoListener(event: KeyboardEvent) {
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

  function generateNewFlow(elems: Element[]) {
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

  function openFlow(openedElements: Element[]) {
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

  function addCourseNode(
    newNode: CourseNode,
    connectToExisting: boolean,
    newCoursePosition: NewCoursePosition,
  ) {
    recordFlowState();
    let newElems = flowInstance.current.toObject().elements;
    if (connectToExisting) {
      newElems = autoconnect(
        newNode,
        newElems,
        nodeData.current.size,
        elemIndexes.current,
        newCoursePosition === "relative",
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
  function onElementClick(event: MouseEvent, targetElem: Element) {
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

  function onElementsRemove(targetElems: Element[]) {
    recordFlowState();
    setElements(
      recalculatedElements(
        removeElements(targetElems, elements)
      )
    );
  }

  /* NODE */
  function onNodeDragStart(_event: MouseEvent, _node: Node) {
    dragStartState.current = flowInstance.current.toObject().elements;
    setContextActive(false);
  }

  function onNodeDragStop(_event: MouseEvent , _node: Node) {
    recordFlowState(dragStartState.current);
  }

  function applyHoverEffectBackward(nodeId: NodeId, newElements: Element[]) {
    for (const id of nodeData.current.get(nodeId).incomingEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i] as Edge, animated: !prefersReducedMotion
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

  function applyHoverEffectForward(nodeId: NodeId, newElements: Element[]) {
    for (const id of nodeData.current.get(nodeId).outgoingEdges) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i] as Edge, animated: !prefersReducedMotion
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

  function onNodeMouseEnter(_event: MouseEvent, targetNode: Node) {
    const nodeId = targetNode.id;
    const newElements = elements.slice();

    applyHoverEffectBackward(nodeId, newElements);
    applyHoverEffectForward(nodeId, newElements);

    setElements(newElements);
  }

  function onNodeMouseLeave(_event: MouseEvent, _targetNode: Node) {
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

  function onNodeContextMenu(event: MouseEvent, node: Node) {
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
  function onConnect({ source, target }: { source: NodeId, target: NodeId }) {
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

  function onEdgeUpdate(oldEdge: Edge, newConnection: Edge) {
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

  function onEdgeContextMenu(event: MouseEvent, edge: Edge) {
    event.preventDefault();
    unsetNodesSelection.current();
    const selectedIds = (
      selectedElements.current // null if nothing selected, not empty array
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
  function onSelectionDragStart(_event: MouseEvent, _nodes: Node[]) {
    dragStartState.current = flowInstance.current.toObject().elements;
  }

  function onSelectionDragStop(_event: MouseEvent, _nodes: Node[]) {
    recordFlowState(dragStartState.current);
  }

  function onSelectionContextMenu(event: MouseEvent, nodes: Node[]) {
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

  function onPaneContextMenu(event: MouseEvent) {
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
          onClick={openNewFlowDlg}
        />
        <HeaderButton
          label="Open"
          description="Open an existing flow"
          onClick={openOpenFileDlg}
        />
        <HeaderButton
          label="Save"
          description="Save current flow to file"
          onClick={saveFlow}
        />
        <HeaderButton
          label="Add course"
          description="Add courses to flow"
          onClick={openAddCourseDlg}
        />
        <HeaderButton
          label="Reflow"
          description="Generate a new layout"
          onClick={reflowElements}
        />
        <HeaderButton
          label="About"
          description="About Prereq Flow"
          onClick={openAboutDlg}
        />
      </Header>

      <ReactFlowProvider>
        <FlowInternalLifter
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
            course: CourseNodeComponent,
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
          <Background variant="lines" gap={32} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
        <ContextMenu
          active={contextActive}
          data={contextData.current}
          xy={mouseXY}
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
              elements[elemIndexes.current.get(targetId)],
              elements.slice(),
              nodeData.current.size,
              elemIndexes.current,
            );
            setElements(recalculatedElements(newElements));
          }}
          disconnectAll={targetIds => {
            resetSelectedElements.current();
            recordFlowState();

            const connectedEdges = new Set();
            for (const id of targetIds) {
              for (const edge of nodeData.current.get(id).incomingEdges) {
                connectedEdges.add(edge);
              }
              for (const edge of nodeData.current.get(id).outgoingEdges) {
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
      <UserControls />

      <NewFlowDialog
        modalCls={newFlowDlgCls}
        closeDialog={closeNewFlowDlg}
        generateNewFlow={generateNewFlow}
      />
      <OpenFileDialog
        modalCls={openFileDlgCls}
        closeDialog={closeOpenFileDlg}
        openFlow={openFlow}
      />
      <AddCourseDialog
        modalCls={addCourseDlgCls}
        closeDialog={closeAddCourseDlg}
        nodeData={nodeData.current}
        addCourseNode={addCourseNode}
      />
      <AboutDialog
        modalCls={aboutDlgCls}
        closeDialog={closeAboutDlg}
      />
    </div>
  );
}
