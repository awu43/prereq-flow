import React, { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  BackgroundVariant,
} from "react-flow-renderer";

import type {
  Node as FlowNode,
  Edge as FlowEdge,
  FlowElement,
  OnLoadParams,
  FlowTransform,
  OnConnectStartParams,
  Connection,
} from "react-flow-renderer";

import "./App.scss";

import type {
  XYPosition,
  NodeId,
  EdgeId,
  ElementId,
  CourseStatus,
  CourseNode,
  ConditionalTypes,
  Node,
  Edge,
  Element,
  NodeDataMap,
  ElemIndexMap,
  NewCoursePosition,
  ContextTargetStatus,
  ContextTarget,
  UpdateNodePos,
  SelectedElements,
  SetSelectedElements,
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
  removeElements,
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
  newPosition,
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

  const flowInstance = useRef<OnLoadParams | null>(null);
  const updateNodePos = useRef<UpdateNodePos>(() => {});
  const selectedElements = useRef<SelectedElements>([]);
  const setSelectedElements = useRef<SetSelectedElements>(() => {});
  const resetSelectedElements = useRef<() => void>(() => {});
  const unsetNodesSelection = useRef<() => void>(() => {});

  const [elements, setElements] = useState<Element[]>(initialElements);
  const nodeData = useRef<NodeDataMap>(initialNodeData);
  const elemIndexes = useRef<ElemIndexMap>(initialIndexes);
  const undoStack = useRef<(Element[])[]>([]);
  const redoStack = useRef<(Element[])[]>([]);
  const dragStartState = useRef<Element[]>([]);
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

  function onLoad(reactFlowInstance: OnLoadParams): void {
    reactFlowInstance.fitView();
    flowInstance.current = reactFlowInstance;
  }

  function recalculatedElements(newElements: Element[]): Element[] {
    nodeData.current = newNodeData(newElements);
    let recalculatedElems = sortElementsByDepth(newElements, nodeData.current);
    elemIndexes.current = newElemIndexes(recalculatedElems);
    recalculatedElems = updateAllNodes(
      recalculatedElems, nodeData.current, elemIndexes.current
    );
    return resetElementStates(recalculatedElems);
  }

  function recordFlowState(elems: Element[] | null = null): void {
    const flowElems = elems ?? flowInstance.current?.toObject().elements;
    if (undoStack.current.length === MAX_UNDO_NUM) {
      undoStack.current.shift();
    }
    undoStack.current.push(resetElementStates(flowElems as Element[]));
    redoStack.current = [];
  }

  useEffect(() => {
    function undoListener(event: KeyboardEvent): void {
      if (event.ctrlKey && event.key === "z") {
        if (undoStack.current.length) {
          redoStack.current.push(
            resetElementStates(
              flowInstance.current?.toObject().elements as Element[]
            )
          );
          const pastElements = undoStack.current.pop() as Element[];
          for (const elem of pastElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({
                id: elem.id,
                pos: (elem as Node).position
              });
            }
          }
          nodeData.current = newNodeData(pastElements);
          elemIndexes.current = newElemIndexes(pastElements);
          setElements(pastElements);
        }
      }
    }
    function redoListener(event: KeyboardEvent): void {
      if (event.ctrlKey && event.key === "y") {
        if (redoStack.current.length) {
          undoStack.current.push(
            resetElementStates(
              flowInstance.current?.toObject().elements as Element[]
            )
          );
          const futureElements = redoStack.current.pop() as Element[];
          for (const elem of futureElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({
                id: elem.id,
                pos: (elem as Node).position
              });
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

  function generateNewFlow(elems: Element[]): void {
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

  function openFlow(openedElements: Element[]): void {
    recordFlowState();
    nodeData.current = newNodeData(openedElements);
    elemIndexes.current = newElemIndexes(openedElements);
    setElements(openedElements);
  }

  function saveFlow(): void {
    const downloadLink = document.createElement("a");
    const fileContents = {
      version: CURRENT_VERSION,
      elements: resetElementStates(
        flowInstance.current?.toObject().elements as Element[]
      ),
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
  ): void {
    recordFlowState();
    let newElems = flowInstance.current?.toObject().elements as Element[];
    if (connectToExisting) {
      newElems = autoconnect(
        newNode,
        newElems,
        nodeData.current.size,
        elemIndexes.current,
        newCoursePosition === "relative",
      );
    } else {
      newElems.push(newNode);
    }
    setElements(recalculatedElements(newElems));
  }

  function reflowElements(): void {
    recordFlowState();
    const newElements = generateNewLayout(
      elements, elemIndexes.current, nodeData.current
    );
    setElements(newElements);
  }

  /* ELEMENT */
  // Single change can only propagate 2 layers deep
  function onElementClick(event: MouseEvent, eventTarget: FlowElement): void {
    // NOTE: eventTarget isn't the actual element so can't use id equality
    // Change .type check if edges changed to have type property
    if (event.altKey && eventTarget.type === "course") {
      resetSelectedElements.current();
      const nodeId = eventTarget.id;
      const newElements = elements.slice();
      let newStatus;
      const targetElement = elements[elemIndexes.current.get(nodeId)];
      switch ((targetElement as Node).data.nodeStatus) {
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
        nodeId,
        newStatus as CourseStatus,
        newElements,
        nodeData.current,
        elemIndexes.current,
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

  function onElementsRemove(targetElems: FlowElement[]): void {
    recordFlowState();
    setElements(
      recalculatedElements(
        removeElements(targetElems as Element[], elements)
      )
    );
  }

  /* NODE */
  function onNodeDragStart(_event: MouseEvent, _node: FlowNode): void {
    dragStartState.current = (
      flowInstance.current?.toObject().elements as Element[]
    );
    setContextActive(false);
  }

  function onNodeDragStop(_event: MouseEvent, _node: FlowNode): void {
    recordFlowState(dragStartState.current);
  }

  function applyHoverEffectBackward(
    nodeId: NodeId,
    newElements: Element[],
  ): void {
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
        data: { ...(newElements[i] as Node).data, nodeConnected: true },
      } as Node;

      if (["or", "and"].includes((newElements[i] as Node).type)) {
        applyHoverEffectBackward(id, newElements);
      }
    }
  }

  function applyHoverEffectForward(
    nodeId: NodeId,
    newElements: Element[],
  ): void {
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
        data: { ...(newElements[i] as Node).data, nodeConnected: true },
      } as Node;

      if (["or", "and"].includes((newElements[i] as Node).type)) {
        applyHoverEffectForward(id, newElements);
      }
    }
  }

  function onNodeMouseEnter(_event: MouseEvent, targetNode: FlowNode): void {
    const nodeId = targetNode.id;
    const newElements = elements.slice();

    applyHoverEffectBackward(nodeId, newElements);
    applyHoverEffectForward(nodeId, newElements);

    setElements(newElements);
  }

  function onNodeMouseLeave(_event: MouseEvent, _targetNode: FlowNode): void {
    const newElements = elements.slice();

    const numNodes = nodeData.current.size;
    const numElems = elemIndexes.current.size;
    for (let i = 0; i < numNodes; i++) {
      newElements[i] = {
        ...newElements[i],
        data: { ...(newElements[i] as Node).data, nodeConnected: false },
      } as Node;
    }
    for (let i = numNodes; i < numElems; i++) {
      newElements[i] = { ...newElements[i] as Edge, animated: false };
    }

    setElements(newElements);
    // Can't target specific elements because of how slow this operation is
    // Using an old for loop for speed over Array.map()
  }

  function onNodeContextMenu(event: MouseEvent, node: FlowNode): void {
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
        const courseNodeSelected = selectedIds.some(nodeId => (
          (elements[elemIndexes.current.get(nodeId)] as Node).type === "course"
        ));
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
      setSelectedElements.current([node as Node]);
      contextData.current = {
        target: node.id,
        targetType: node.type === "course" ? "coursenode" : "conditionalnode",
        targetStatus: node.data.nodeStatus,
      };
    }
    setMouseXY(newPosition(event.clientX, event.clientY));
    setContextActive(true);
  }

  /* EDGE */
  function onConnect(connection: FlowEdge | Connection): void {
    const source = connection.source as NodeId;
    const target = connection.target as NodeId;
    const newEdgeId = edgeArrowId(source, target);
    const reverseEdgeId = edgeArrowId(target, source);
    // Creating a cycle causes infinite recursion in depth calculation
    if (!elemIndexes.current.has(newEdgeId)
        && !elemIndexes.current.has(reverseEdgeId)) {
      recordFlowState();
      const newElements = resetElementStates(elements);
      // Need to "unhover" to return to base state
      const sourceNode = elements[elemIndexes.current.get(source)];
      newElements.push({
        id: newEdgeId,
        source,
        target,
        className: (sourceNode as Node).data.nodeStatus,
        label: null,
      });
      setElements(recalculatedElements(newElements));
    }
  }

  // { nodeId, handleId, handleType }: OnConnectStartParams
  function onConnectStart(
    _event: MouseEvent,
    _params: OnConnectStartParams,
  ): void {
    setContextActive(false);
  }

  function onEdgeUpdate(oldEdge: FlowEdge, newConnection: Connection): void {
    const newSource = newConnection.source as NodeId;
    const newTarget = newConnection.target as NodeId;
    const newEdgeId = edgeArrowId(newSource, newTarget);
    const reverseEdgeId = edgeArrowId(newTarget, newSource);
    if (!elemIndexes.current.has(newEdgeId)
        && !elemIndexes.current.has(reverseEdgeId)) {
      recordFlowState();
      setElements(prevElems => {
        const newElements = prevElems.slice();
        const sourceNode = prevElems[elemIndexes.current.get(newSource)];
        newElements[elemIndexes.current.get(oldEdge.id)] = {
          ...oldEdge, // Keep CC status
          id: newEdgeId,
          source: newConnection.source as NodeId,
          target: newConnection.target as NodeId,
          className: (sourceNode as Node).data.nodeStatus,
        } as Edge;
        return recalculatedElements(newElements);
      });
      // Need to use functional update here for some reason
    }
  }

  function onEdgeContextMenu(event: MouseEvent, edge: FlowEdge): void {
    event.preventDefault();
    unsetNodesSelection.current();
    const selectedIds = (
      selectedElements.current // null if nothing selected, not empty array
        ? selectedElements.current.map(elem => elem.id)
        : []
    );
    const targetStatus = (
      (elements[elemIndexes.current.get(edge.id)] as Edge).label
    );
    if (selectedIds.includes(edge.id)) {
      if (selectedIds.length === 1) {
        contextData.current = {
          target: edge.id,
          targetType: "edge",
          targetStatus: targetStatus as ContextTargetStatus,
        };
      } else {
        contextData.current = {
          target: selectedIds,
          targetType: "mixedmultiselect",
          targetStatus: "",
        };
      }
    } else {
      setSelectedElements.current([edge as Edge]);
      contextData.current = {
        target: edge.id,
        targetType: "edge",
        targetStatus: targetStatus as ContextTargetStatus,
      };
    }
    setMouseXY(newPosition(event.clientX, event.clientY));
    setContextActive(true);
  }

  /* MOVE */
  function onMoveStart(_flowTransform: FlowTransform | undefined): void {
    setContextActive(false);
  }

  /* SELECTION */
  function onSelectionDragStart(_event: MouseEvent, _nodes: FlowNode[]): void {
    dragStartState.current = (
      flowInstance.current?.toObject().elements as Element[]
    );
  }

  function onSelectionDragStop(_event: MouseEvent, _nodes: FlowNode[]): void {
    recordFlowState(dragStartState.current);
  }

  function onSelectionContextMenu(event: MouseEvent, nodes: FlowNode[]): void {
    event.preventDefault();
    const courseNodeSelected = (
      nodes.some(node => (
        (elements[elemIndexes.current.get(node.id)] as Node).type === "course"
      ))
    );
    contextData.current = {
      target: nodes.map(n => n.id),
      targetType: (
        courseNodeSelected ? "courseselection" : "conditionalselection"
      ),
      targetStatus: "",
    };
    setMouseXY(newPosition(event.clientX, event.clientY));
    setContextActive(true);
  }

  /* PANE */
  // function onPaneClick(_event) {
  //   setContextActive(false);
  // }

  function onPaneContextMenu(event: MouseEvent): void {
    event.preventDefault();
    resetSelectedElements.current();
    unsetNodesSelection.current();
    contextData.current = {
      target: "",
      targetType: "pane",
      targetStatus: "",
    };
    setMouseXY(newPosition(event.clientX, event.clientY));
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
          <Background variant={BackgroundVariant.Lines} gap={32} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
        <ContextMenu
          active={contextActive}
          data={contextData.current}
          xy={mouseXY}
          setSelectionStatuses={
            (nodeIds: NodeId[], newStatus: CourseStatus): void => {
              resetSelectedElements.current();
              recordFlowState();

              const newElements = elements.slice();
              for (const id of nodeIds) {
                const node = elements[elemIndexes.current.get(id)] as Node;
                if (node.type === "course") {
                  setNodeStatus(
                    id, newStatus, newElements,
                    nodeData.current, elemIndexes.current
                  );
                }
              }

              setElements(
                updateAllNodes(
                  newElements, nodeData.current, elemIndexes.current
                )
              );
            }
          }
          toggleEdgeConcurrency={(edgeId: EdgeId): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = elements.slice();
            const i = elemIndexes.current.get(edgeId);
            const targetEdge = newElements[i] as Edge;

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
              updateAllNodes(
                newElements, nodeData.current, elemIndexes.current
              )
            );
          }}
          deleteElems={(elemIds: ElementId[]): void => {
            resetSelectedElements.current();
            onElementsRemove(
              elemIds.map(id => elements[elemIndexes.current.get(id)])
            );
          }}
          connectAll={(targetId: NodeId): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = autoconnect(
              elements[elemIndexes.current.get(targetId)] as CourseNode,
              elements.slice(),
              nodeData.current.size,
              elemIndexes.current,
            );
            setElements(recalculatedElements(newElements));
          }}
          disconnectAll={(targetIds: NodeId[]): void => {
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
          newConditionalNode={
            (type: ConditionalTypes, xy: XYPosition): void => {
              resetSelectedElements.current();
              recordFlowState();

              const newNode = newConditionalNode(
                type, flowInstance.current?.project(xy)
              );

              setElements(
                recalculatedElements(elements.concat([newNode]))
              );
            }
          }
          reroute={(targetId: NodeId): void => {
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
                  } as Edge);
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