// import React from "react";
import {
  useStoreState,
  useStoreActions,
} from "react-flow-renderer";

export default function FlowStoreLifter({
  selectedElements,
  setSelectedElements,
  resetSelectedElements,
  setUserSelection,
}) {
  selectedElements.current = useStoreState(state => state.selectedElements);
  setSelectedElements.current = useStoreActions(action => (
    action.setSelectedElements
  ));
  resetSelectedElements.current = useStoreActions(action => (
    action.resetSelectedElements
  ));
  setUserSelection.current = useStoreActions(actions => (
    actions.setUserSelection
  ));
  return null;
}
