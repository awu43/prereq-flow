// import React from "react";
import { useStoreState, useStoreActions } from "react-flow-renderer";

export default function FlowStoreLifter({
  selectedElements,
  resetSelectedElements,
  setUserSelection,
}) {
  selectedElements.current = useStoreState(state => state.selectedElements);
  resetSelectedElements.current = useStoreActions(action => (
    action.resetSelectedElements
  ));
  setUserSelection.current = useStoreActions(actions => (
    actions.setUserSelection
  ));
  return null;
}
