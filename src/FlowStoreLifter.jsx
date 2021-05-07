// import React from "react";
import { useStoreActions } from "react-flow-renderer";

export default function FlowStoreLifter({ resetSelectedElements }) {
  resetSelectedElements.current = useStoreActions(action => (
    action.resetSelectedElements
  ));
  return null;
}
