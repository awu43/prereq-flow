// https://github.com/wbkd/react-flow/blob/main/src/store/actions.ts

import {
  useStoreState,
  useStoreActions,
} from "react-flow-renderer";

export default function FlowStoreLifter({
  selectedElements,
  setSelectedElements,
  resetSelectedElements,
  unsetNodesSelection,
}) {
  selectedElements.current = useStoreState(state => state.selectedElements);
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
