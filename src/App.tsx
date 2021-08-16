import React, { useState, useEffect, useRef, useMemo } from "react";
import type { MouseEvent } from "react";

import classNames from "classnames";

import ReactFlow, {
  Background,
  MiniMap,
  Controls,
  ReactFlowProvider,
  BackgroundVariant,
} from "react-flow-renderer";

import type {
  XYPosition,
  Node as FlowNode,
  Edge as FlowEdge,
  FlowElement,
  OnLoadParams,
  FlowTransform,
  OnConnectStartParams,
  Connection,
} from "react-flow-renderer";

import Tippy from "@tippyjs/react";
// eslint-disable-next-line import/no-extraneous-dependencies
import "tippy.js/dist/tippy.css";

import type {
  NodeId,
  EdgeId,
  ElementId,
  CourseData,
  CourseStatus,
  CourseNode,
  ConditionalTypes,
  Node,
  Edge,
  Element,
  NodeDataMap,
  ElemIndexMap,
  ConnectTo,
  NewCoursePosition,
} from "types/main";
import type { ContextTarget } from "types/ContextMenu";

import triangleIcon from "@icons/triangle.svg";
import tableIcon from "@icons/table.svg";

import "./App.scss";

import usePrefersReducedMotion from "./usePrefersReducedMotion";
import useDialogStatus from "./useDialogStatus";

import Header from "./components/Header";
import HeaderButton from "./components/HeaderButton";
import FlowInternalLifter from "./components/FlowInternalLifter";
import type {
  UpdateNodePos,
  SelectedElements,
  SetSelectedElements,
} from "./components/FlowInternalLifter";
import { default as CourseNodeComponent } from "./components/CourseNode";
import OrNode from "./components/OrNode";
import AndNode from "./components/AndNode";
import ContextMenu from "./components/ContextMenu";
import CustomEdge from "./components/CustomEdge";
import UserControls from "./components/UserControls";

import NewFlowDialog from "./components/dialogs/NewFlowDialog";
import OpenFileDialog, {
  CURRENT_VERSION,
} from "./components/dialogs/OpenFileDialog";
import AddCourseDialog from "./components/dialogs/AddCourseDialog";
import AboutDialog from "./components/dialogs/AboutDialog";
import TableDialog from "./components/dialogs/TableDialog";
import EditDataDialog from "./components/dialogs/EditDataDialog";

import {
  isNode,
  isCourseNode,
  removeElements,
  ZERO_POSITION,
  newConditionalNode,
  edgeArrowId,
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

const MAX_UNDO_NUM = 20;

interface AppProps {
  initialElements: Element[];
}
export default function App({ initialElements }: AppProps): JSX.Element {
  const [newFlowDlgCls, openNewFlowDlg, closeNewFlowDlg] = useDialogStatus();
  const [openFileDlgCls, openOpenFileDlg, closeOpenFileDlg] = useDialogStatus();
  const [addCourseDlgCls, openAddCourseDlg, closeAddCourseDlg] =
    useDialogStatus();
  const [aboutDlgCls, openAboutDlg, closeAboutDlg] = useDialogStatus();

  const [minimapPinned, setMinimapPinned] = useState(true);
  const [tableDlgCls, openTableDlg, closeTableDlg] = useDialogStatus();
  const [editDlgCls, openEditDlg, closeEditDlg] = useDialogStatus();

  const fileName = useRef("untitled-flow.json");

  const flowInstance = useRef<OnLoadParams>();
  const updateNodePos = useRef<UpdateNodePos>(() => {});
  const selectedElements = useRef<SelectedElements>([]);
  const setSelectedElements = useRef<SetSelectedElements>(() => {});
  const resetSelectedElements = useRef<() => void>(() => {});
  const unsetNodesSelection = useRef<() => void>(() => {});

  const [elements, setElements] = useState<Element[]>(initialElements);
  const nodeData = useRef<NodeDataMap>(newNodeData(initialElements));
  const elemIndexes = useRef<ElemIndexMap>(newElemIndexes(initialElements));
  const undoStack = useRef<Element[][]>([]);
  const redoStack = useRef<Element[][]>([]);
  const dragStartState = useRef<Element[]>([]);
  // Because drag start is triggered on mousedown even if no movement
  // occurs, the flow state at drag start should only be added to undo
  // history on drag end

  const [contextActive, setContextActive] = useState(false);
  const contextData = useRef<ContextTarget>({
    target: [],
    targetType: "pane",
    targetStatus: "",
  });
  const [mouseXY, setMouseXY] = useState<XYPosition>(ZERO_POSITION);

  const editTargetData = useRef<CourseData>({
    id: "",
    name: "",
    credits: "",
    description: "",
    prerequisite: "",
    offered: "",
  });

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
      recalculatedElems,
      nodeData.current,
      elemIndexes.current,
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

  const dialogOpen = useMemo(
    () =>
      [
        newFlowDlgCls,
        openFileDlgCls,
        addCourseDlgCls,
        aboutDlgCls,
        editDlgCls,
      ].some(cls => !cls.includes("--display-none")),
    [newFlowDlgCls, openFileDlgCls, addCourseDlgCls, aboutDlgCls, editDlgCls],
  );

  useEffect(() => {
    function undoListener(event: KeyboardEvent): void {
      if (event.ctrlKey && event.key === "z" && !dialogOpen) {
        if (undoStack.current.length) {
          unsetNodesSelection.current();
          redoStack.current.push(
            resetElementStates(
              flowInstance.current?.toObject().elements as Element[],
            ),
          );
          const pastElements = undoStack.current.pop() as Element[];
          for (const elem of pastElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({
                id: elem.id,
                pos: (elem as Node).position,
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
      if (event.ctrlKey && event.key === "y" && !dialogOpen) {
        if (redoStack.current.length) {
          unsetNodesSelection.current();
          undoStack.current.push(
            resetElementStates(
              flowInstance.current?.toObject().elements as Element[],
            ),
          );
          const futureElements = redoStack.current.pop() as Element[];
          for (const elem of futureElements) {
            if (nodeData.current.has(elem.id)) {
              updateNodePos.current({
                id: elem.id,
                pos: (elem as Node).position,
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
    return () => {
      document.removeEventListener("keydown", undoListener);
      document.removeEventListener("keydown", redoListener);
    };
  }, [dialogOpen]);

  function generateNewFlow(elems: Element[]): void {
    recordFlowState();
    fileName.current = "untitled-flow.json";
    nodeData.current = newNodeData(elems);
    let newElements = sortElementsByDepth(elems.slice(), nodeData.current);
    elemIndexes.current = newElemIndexes(newElements);
    newElements = updateAllNodes(
      newElements,
      nodeData.current,
      elemIndexes.current,
    );
    newElements = generateNewLayout(
      newElements,
      elemIndexes.current,
      nodeData.current,
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
        flowInstance.current?.toObject().elements as Element[],
      ),
    };
    const fileBlob = new Blob([JSON.stringify(fileContents, null, 2)], {
      type: "application/json",
    });
    downloadLink.href = URL.createObjectURL(fileBlob);
    downloadLink.download = fileName.current;
    downloadLink.click();
  }

  function addCourseNode(
    newNode: CourseNode,
    connectTo: ConnectTo,
    newCoursePosition: NewCoursePosition = "relative",
  ): void {
    recordFlowState();
    let newElems = flowInstance.current?.toObject().elements as Element[];
    if (connectTo.prereq || connectTo.postreq) {
      newElems = autoconnect(
        newNode,
        newElems,
        nodeData.current.size,
        elemIndexes.current,
        connectTo,
        newCoursePosition === "relative",
      );
    } else {
      newElems.push(newNode);
    }
    setElements(recalculatedElements(newElems));
  }

  function addExternalFlow(extElems: Element[], connectTo: ConnectTo): void {
    recordFlowState();
    let tempElems = flowInstance.current?.toObject().elements as Element[];
    if (connectTo.prereq || connectTo.postreq) {
      for (const elem of extElems) {
        if (isCourseNode(elem)) {
          tempElems = autoconnect(
            elem,
            tempElems,
            nodeData.current.size,
            elemIndexes.current,
            connectTo,
            false,
          );
          tempElems.pop();
        }
      }
    }

    const newElements = [...tempElems, ...extElems];
    const newIndexes = newElemIndexes(newElements);

    const tempLayout = generateNewLayout(
      JSON.parse(JSON.stringify(newElements)),
      newElemIndexes(newElements),
      newNodeData(newElements),
    );
    const tempIndexes = newElemIndexes(tempLayout);
    const tempData = newNodeData(tempLayout);

    let dy = 0;
    for (const elem of tempElems) {
      if (isNode(elem)) {
        dy = Math.max(elem.position.y, dy);
      }
    }

    for (const elem of extElems) {
      if (!isNode(elem)) {
        continue;
      }

      const { id } = elem;
      const ni = newIndexes.get(id);
      const tempNode = tempLayout[tempIndexes.get(id)] as Node;
      const tempPos = tempNode.position;

      const newElemPos =
        !tempData.get(id).incomingEdges.length &&
        !tempData.get(id).outgoingEdges.length
          ? newPosition(Math.random() * 150, Math.random() * 300 + dy)
          : newPosition(tempPos.x, tempPos.y + dy);
      (newElements[ni] as Node).position = newElemPos;
    }

    setElements(recalculatedElements(newElements));
  }

  function reflowElements(): void {
    recordFlowState();
    const newElements = generateNewLayout(
      elements,
      elemIndexes.current,
      nodeData.current,
    );
    setElements(newElements);
  }

  function saveCourseData(originalId: NodeId, newData: CourseData): void {
    recordFlowState();
    const newElements = elements.slice();
    const i = elemIndexes.current.get(originalId);
    newElements[i] = {
      ...newElements[i],
      id: newData.id,
      data: { ...newElements[i].data, ...newData },
    } as CourseNode;
    if (originalId !== newData.id) {
      for (const iNode of nodeData.current.get(originalId).incomingNodes) {
        const oldEdgeId = edgeArrowId(iNode, originalId);
        const j = elemIndexes.current.get(oldEdgeId);
        newElements[j] = {
          ...newElements[j],
          id: edgeArrowId(iNode, newData.id),
          target: newData.id,
        } as Edge;
      }
      for (const oNode of nodeData.current.get(originalId).outgoingNodes) {
        const oldEdgeId = edgeArrowId(originalId, oNode);
        const j = elemIndexes.current.get(oldEdgeId);
        newElements[j] = {
          ...newElements[j],
          id: edgeArrowId(newData.id, oNode),
          source: newData.id,
        } as Edge;
      }
    }

    setElements(recalculatedElements(newElements));
  }

  /* ELEMENT */
  // Single change can only propagate 2 layers deep
  function onElementClick(event: MouseEvent, eventTarget: FlowElement): void {
    // NOTE: eventTarget isn't the actual element so can't use id equality
    if (event.altKey && isCourseNode(eventTarget as Element)) {
      resetSelectedElements.current();
      const nodeId = eventTarget.id;
      const newElements = elements.slice();
      let newStatus;
      const targetElement = elements[elemIndexes.current.get(nodeId)] as Node;
      switch (targetElement.data.nodeStatus) {
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
          id,
          newElements,
          nodeData.current,
          elemIndexes.current,
        );
      }
      const secondDiff = new Set(
        firstDiff.flatMap(id => nodeData.current.get(id).outgoingNodes),
      );
      for (const id of secondDiff.values()) {
        updateNodeStatus(
          id,
          newElements,
          nodeData.current,
          elemIndexes.current,
        );
      }

      setElements(newElements);
    }
  }

  function onElementsRemove(targetElems: FlowElement[]): void {
    recordFlowState();
    setElements(
      recalculatedElements(removeElements(targetElems as Element[], elements)),
    );
  }

  /* NODE */
  function onNodeDragStart(_event: MouseEvent, _node: FlowNode): void {
    dragStartState.current = flowInstance.current?.toObject()
      .elements as Element[];
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
        ...newElements[i],
        animated: !prefersReducedMotion,
      } as Edge;
    }

    for (const id of nodeData.current.get(nodeId).incomingNodes) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: true },
      } as Node;

      if (["or", "and"].includes(newElements[i].type)) {
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
        ...newElements[i],
        animated: !prefersReducedMotion,
      } as Edge;
    }

    for (const id of nodeData.current.get(nodeId).outgoingNodes) {
      const i = elemIndexes.current.get(id);
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: true },
      } as Node;

      if (["or", "and"].includes(newElements[i].type)) {
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
    const numElems = newElements.length;
    for (let i = 0; i < numNodes; i++) {
      newElements[i] = {
        ...newElements[i],
        data: { ...newElements[i].data, nodeConnected: false },
      } as Node;
    }
    for (let i = numNodes; i < numElems; i++) {
      newElements[i] = { ...newElements[i], animated: false } as Edge;
    }

    setElements(newElements);
    // Can't target specific elements because of how slow this operation is
    // Using an old for loop for speed over Array.map()
  }

  function onNodeContextMenu(event: MouseEvent, node: FlowNode): void {
    event.preventDefault();
    unsetNodesSelection.current();
    const selectedIds = selectedElements.current
      ? selectedElements.current.map(elem => elem.id)
      : [];
    if (selectedIds.includes(node.id)) {
      if (selectedIds.length === 1) {
        // Only one node selected
        contextData.current = {
          target: [node.id],
          targetType: node.type === "course" ? "coursenode" : "conditionalnode",
          targetStatus: node.data.nodeStatus,
        };
      } else if (!selectedIds.some(elemId => elemId.includes("->"))) {
        // Multiple nodes selected
        const courseNodeSelected = selectedIds.some(
          nodeId =>
            (elements[elemIndexes.current.get(nodeId)] as Node).type ===
            "course",
        );
        contextData.current = {
          target: selectedIds,
          targetType: courseNodeSelected
            ? "coursemultiselect"
            : "conditionalmultiselect",
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
        target: [node.id],
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
    if (
      !elemIndexes.current.has(newEdgeId) &&
      !elemIndexes.current.has(reverseEdgeId)
    ) {
      recordFlowState();
      const newElements = resetElementStates(elements);
      // Need to "unhover" to return to base state
      const sourceNode = elements[elemIndexes.current.get(source)] as Node;
      newElements.push({
        id: newEdgeId,
        type: "custom",
        source,
        target,
        className: sourceNode.data.nodeStatus,
        data: { concurrent: false },
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
    if (
      !elemIndexes.current.has(newEdgeId) &&
      !elemIndexes.current.has(reverseEdgeId)
    ) {
      recordFlowState();
      setElements(prevElems => {
        const newElements = prevElems.slice();
        const sourceNode = prevElems[
          elemIndexes.current.get(newSource)
        ] as Node;
        newElements[elemIndexes.current.get(oldEdge.id)] = {
          ...oldEdge, // Keep CC status
          id: newEdgeId,
          source: newConnection.source as NodeId,
          target: newConnection.target as NodeId,
          className: sourceNode.data.nodeStatus,
        } as Edge;
        return recalculatedElements(newElements);
      });
      // Need to use functional update here for some reason
    }
  }

  function onEdgeContextMenu(event: MouseEvent, edge: FlowEdge): void {
    event.preventDefault();
    unsetNodesSelection.current();
    // selectedElements null if nothing selected, not empty array
    const selectedIds = selectedElements.current
      ? selectedElements.current.map(elem => elem.id)
      : [];
    const targetStatus = (elements[elemIndexes.current.get(edge.id)] as Edge)
      .data.concurrent
      ? "concurrent"
      : "";
    if (selectedIds.includes(edge.id)) {
      if (selectedIds.length === 1) {
        contextData.current = {
          target: [edge.id],
          targetType: "edge",
          targetStatus,
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
        target: [edge.id],
        targetType: "edge",
        targetStatus,
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
    dragStartState.current = flowInstance.current?.toObject()
      .elements as Element[];
  }

  function onSelectionDragStop(_event: MouseEvent, _nodes: FlowNode[]): void {
    recordFlowState(dragStartState.current);
  }

  function onSelectionContextMenu(event: MouseEvent, nodes: FlowNode[]): void {
    event.preventDefault();
    const courseNodeSelected = nodes.some(
      node =>
        (elements[elemIndexes.current.get(node.id)] as Node).type === "course",
    );
    contextData.current = {
      target: nodes.map(n => n.id),
      targetType: courseNodeSelected
        ? "courseselection"
        : "conditionalselection",
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
      target: [],
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
          label="Add courses"
          description="Add courses to current flow"
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

      <Tippy
        content={minimapPinned ? "Hide minimap" : "Show minimap"}
        trigger="mouseenter"
        hideOnClick={false}
        placement="right"
        duration={prefersReducedMotion ? 0 : 100}
      >
        <button
          className={classNames("react-flow__minimap-pin-button", {
            "react-flow__minimap-pin-button--pinned": minimapPinned,
          })}
          type="button"
          onClick={() => setMinimapPinned(!minimapPinned)}
        >
          <img src={triangleIcon} alt="Show/hide minimap" />
        </button>
      </Tippy>

      <button
        type="button"
        className="TableDialog__open-btn"
        onClick={openTableDlg}
      >
        <img src={tableIcon} alt="Open table dialog" />
      </button>

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
          minZoom={0.2}
          // Instance
          onLoad={onLoad}
          // Basic Props
          elements={elements}
          nodeTypes={{
            course: CourseNodeComponent,
            or: OrNode,
            and: AndNode,
          }}
          edgeTypes={{ custom: CustomEdge }}
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
          <MiniMap
            className={classNames({
              "react-flow__minimap--pinned": minimapPinned,
            })}
            nodeColor={node => {
              switch ((node as Node).data.nodeStatus) {
                case "completed":
                  return "#000000";
                case "enrolled":
                  return "#9400d3";
                case "ready":
                  return "#32cd32";
                case "under-one-away":
                  return "#daa520";
                case "one-away":
                  return "#ff8c00";
                case "over-one-away":
                  return "#ff0000";
                default:
                  return "#808080";
              }
            }}
            nodeBorderRadius={2}
          />
          <Controls showInteractive={false} />
        </ReactFlow>
        <ContextMenu
          elements={elements}
          nodeData={nodeData.current}
          elemIndexes={elemIndexes.current}
          active={contextActive}
          data={contextData.current}
          xy={mouseXY}
          setSelectionStatuses={(
            nodeIds: NodeId[],
            newStatus: CourseStatus,
          ): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = elements.slice();
            for (const id of nodeIds) {
              const node = elements[elemIndexes.current.get(id)] as Node;
              if (node.type === "course") {
                setNodeStatus(
                  id,
                  newStatus,
                  newElements,
                  nodeData.current,
                  elemIndexes.current,
                );
              }
            }

            setElements(
              updateAllNodes(
                newElements,
                nodeData.current,
                elemIndexes.current,
              ),
            );
          }}
          toggleEdgeConcurrency={(edgeId: EdgeId): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = elements.slice();
            const i = elemIndexes.current.get(edgeId);
            const targetEdge = newElements[i] as Edge;

            newElements[i] = {
              ...targetEdge,
              data: { concurrent: !targetEdge.data.concurrent },
            };

            setElements(
              updateAllNodes(
                newElements,
                nodeData.current,
                elemIndexes.current,
              ),
            );
          }}
          editCourseData={(courseId: NodeId): void => {
            const targetNode = elements[
              elemIndexes.current.get(courseId)
            ] as CourseNode;
            editTargetData.current = { ...targetNode.data };
            openEditDlg();
          }}
          deleteElems={(elemIds: ElementId[]): void => {
            resetSelectedElements.current();
            onElementsRemove(
              elemIds.map(id => elements[elemIndexes.current.get(id)]),
            );
          }}
          connect={(
            targetId: NodeId,
            to: ConnectTo = { prereq: true, postreq: true },
          ): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newElements = autoconnect(
              elements[elemIndexes.current.get(targetId)] as CourseNode,
              elements.slice(),
              nodeData.current.size,
              elemIndexes.current,
              to,
            );
            setElements(recalculatedElements(newElements));
          }}
          disconnect={(
            targetIds: NodeId[],
            from: ConnectTo = { prereq: true, postreq: true },
          ): void => {
            resetSelectedElements.current();
            recordFlowState();

            const connectedEdges = new Set();
            for (const id of targetIds) {
              if (from.prereq) {
                for (const edge of nodeData.current.get(id).incomingEdges) {
                  connectedEdges.add(edge);
                }
              }
              if (from.postreq) {
                for (const edge of nodeData.current.get(id).outgoingEdges) {
                  connectedEdges.add(edge);
                }
              }
            }

            setElements(
              recalculatedElements(
                elements.filter(elem => !connectedEdges.has(elem.id)),
              ),
            );
          }}
          newConditionalNode={(
            type: ConditionalTypes,
            xy: XYPosition,
          ): void => {
            resetSelectedElements.current();
            recordFlowState();

            const newNode = newConditionalNode(
              type,
              flowInstance.current?.project(xy),
            );

            setElements(recalculatedElements(elements.concat([newNode])));
          }}
          rerouteSingle={(targetId: NodeId): void => {
            resetSelectedElements.current();
            recordFlowState();

            let newElements = elements.slice();

            const targetNode = newElements[elemIndexes.current.get(targetId)];
            const targetData = nodeData.current.get(targetId);

            for (const iNode of targetData.incomingNodes) {
              for (const oNode of targetData.outgoingNodes) {
                const oldEdgeId = edgeArrowId(iNode, targetId);
                const newEdgeId = edgeArrowId(iNode, oNode);
                if (!elemIndexes.current.has(newEdgeId)) {
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
          reroutePointless={(): void => {
            resetSelectedElements.current();
            recordFlowState();

            let newElements = elements.slice();
            let tempNodeData = newNodeData(elements);
            let tempIndexes = newElemIndexes(elements);
            const numNodes = tempNodeData.size;
            for (let i = 0; i < numNodes; i++) {
              const elem = elements[i] as Node;
              if (
                elem.type === "or" &&
                tempNodeData.get(elem.id).incomingNodes.length <= 1
              ) {
                const incoming = tempNodeData.get(elem.id).incomingNodes;
                if (incoming.length) {
                  const [source] = incoming;
                  const oldEdgeId = edgeArrowId(source, elem.id);
                  const outgoing = tempNodeData.get(elem.id).outgoingNodes;
                  for (const target of outgoing) {
                    const newEdgeId = edgeArrowId(source, target);
                    if (!tempIndexes.has(newEdgeId)) {
                      newElements.push({
                        ...newElements[tempIndexes.get(oldEdgeId)],
                        id: newEdgeId,
                        source,
                        target,
                      } as Edge);
                    }
                  }
                }
                newElements = removeElements([elem], newElements);
                tempNodeData = newNodeData(newElements);
                tempIndexes = newElemIndexes(newElements);
              }
            }

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
        fileName={fileName}
      />
      <AddCourseDialog
        modalCls={addCourseDlgCls}
        closeDialog={closeAddCourseDlg}
        nodeData={nodeData.current}
        addCourseNode={addCourseNode}
        addExternalFlow={addExternalFlow}
      />
      <AboutDialog modalCls={aboutDlgCls} closeDialog={closeAboutDlg} />

      <TableDialog
        modalCls={tableDlgCls}
        closeDialog={closeTableDlg}
        elements={elements}
        onElementsRemove={onElementsRemove}
      />
      <EditDataDialog
        modalCls={editDlgCls}
        closeDialog={closeEditDlg}
        originalData={editTargetData.current}
        nodeData={nodeData.current}
        saveCourseData={saveCourseData}
        resetSelectedElements={resetSelectedElements.current}
      />
    </div>
  );
}
