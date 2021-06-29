import type { MutableRefObject } from "react";

// https://github.com/wbkd/react-flow/blob/main/src/store/actions.ts
import { useStoreState, useStoreActions } from "react-flow-renderer";
import type { NodePosUpdate, FlowElement } from "react-flow-renderer";

import type { Element } from "types/main";

export type UpdateNodePos = ({ id, pos }: NodePosUpdate) => void;
export type SelectedElements = FlowElement[];
export type SetSelectedElements = (e: FlowElement[]) => void;

interface FlowInternalLifterProps {
  updateNodePos: MutableRefObject<UpdateNodePos>;
  selectedElements: MutableRefObject<SelectedElements>;
  setSelectedElements: MutableRefObject<SetSelectedElements>;
  resetSelectedElements: MutableRefObject<() => void>;
  unsetNodesSelection: MutableRefObject<() => void>;
}
export default function FlowInternalLifter({
  updateNodePos,
  selectedElements,
  setSelectedElements,
  resetSelectedElements,
  unsetNodesSelection,
}: FlowInternalLifterProps) {
  updateNodePos.current = useStoreActions(state => state.updateNodePos);
  selectedElements.current = useStoreState(
    state => state.selectedElements
  ) as Element[];
  setSelectedElements.current = useStoreActions(action => (
    action.setSelectedElements
  ));
  resetSelectedElements.current = useStoreActions(action => (
    action.resetSelectedElements
  ));
  unsetNodesSelection.current = useStoreActions(actions => (
    actions.unsetNodesSelection
  ));

  return null;
}
