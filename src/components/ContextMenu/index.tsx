import { useStoreActions } from "react-flow-renderer";

import type { CourseStatus } from "types/main";
import type { ContextMenuProps } from "types/ContextMenu";

import "./ContextMenu.scss";

import CourseNodeOpts from "./CourseNodeOpts";
import ConditionalNodesOpts from "./ConditionalNodesOpts";
import PaneOpts from "./PaneOpts";

export default function ContextMenu(
  props: ContextMenuProps,
): JSX.Element | null {
  const unsetNodesSelection = useStoreActions(
    actions => actions.unsetNodesSelection,
  );

  if (!props.active) {
    return null;
  }

  const { target, targetType, targetStatus } = props.data;

  function deleteAndClearSelection(): void {
    unsetNodesSelection();
    props.deleteElems(target);
  }

  function setSelectionStatusOpt(
    status: CourseStatus,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => props.setSelectionStatuses(target, status)}>
        <p>{label}</p>
      </li>
    );
  }
  const setReadyOpt = setSelectionStatusOpt("ready", "Planned");
  const setEnrolledOpt = setSelectionStatusOpt("enrolled", "Enrolled");
  const setCompletedOpt = setSelectionStatusOpt("completed", "Completed");

  function connectOpt(
    prereq: boolean,
    postreq: boolean,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => props.connect(target[0], { prereq, postreq })}>
        <p>{label}</p>
      </li>
    );
  }
  const connectPrereqsOpt = connectOpt(true, false, "Connect\u00A0prereqs");
  const connectPostreqsOpt = connectOpt(false, true, "Connect\u00A0postreqs");
  const connectAllOpt = connectOpt(true, true, "Connect\u00A0all");

  function disconnectOpt(
    prereq: boolean,
    postreq: boolean,
    label: string,
  ): JSX.Element {
    return (
      <li onClick={() => props.disconnect(target, { prereq, postreq })}>
        <p>{label}</p>
      </li>
    );
  }
  const disconnectPrereqsOpt = disconnectOpt(
    true,
    false,
    "Disconnect\u00A0prereqs",
  );
  const disconnectPostreqsOpt = disconnectOpt(
    false,
    true,
    "Disconnect\u00A0postreqs",
  );
  const disconnectAllOpt = disconnectOpt(true, true, "Disconnect\u00A0all");

  const deleteElemsOpt = (
    <li onClick={() => props.deleteElems(target)}>
      <p>Delete</p>
    </li>
  );
  const deleteAndClearOpt = (
    <li onClick={deleteAndClearSelection}>
      <p>Delete</p>
    </li>
  );

  const sharedOpts = {
    setReadyOpt,
    setEnrolledOpt,
    setCompletedOpt,

    connectPrereqsOpt,
    connectPostreqsOpt,
    connectAllOpt,

    disconnectPrereqsOpt,
    disconnectPostreqsOpt,
    disconnectAllOpt,

    deleteElemsOpt,
    deleteAndClearOpt,
  };

  let menuOptions;
  switch (targetType) {
    case "coursenode":
      menuOptions = (
        <CourseNodeOpts contextProps={props} sharedOpts={sharedOpts} />
      );
      break;
    case "conditionalnode":
      menuOptions = (
        <ConditionalNodesOpts contextProps={props} sharedOpts={sharedOpts} />
      );
      break;
    case "edge":
      // Single edge
      menuOptions = (
        <>
          <li
            key="concurrent"
            className={targetStatus === "concurrent" ? "current" : ""}
            onClick={() => props.toggleEdgeConcurrency(target[0])}
          >
            <p>Concurrent</p>
          </li>
          <hr />
          {deleteElemsOpt}
        </>
      );
      break;
    case "coursemultiselect":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          {setReadyOpt}
          {setEnrolledOpt}
          {setCompletedOpt}
          <hr />
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    case "conditionalmultiselect":
      // At least one conditional node
      menuOptions = (
        <>
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteElemsOpt}
        </>
      );
      break;
    case "mixedmultiselect":
      // Multiple edges
      // At least one node and at least one edge
      menuOptions = deleteElemsOpt;
      break;
    case "courseselection":
      // Multiple nodes containing at least one course node
      menuOptions = (
        <>
          {setReadyOpt}
          {setEnrolledOpt}
          {setCompletedOpt}
          <hr />
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteAndClearOpt}
        </>
      );
      break;
    case "conditionalselection":
      // At least one conditional node
      menuOptions = (
        <>
          {disconnectPrereqsOpt}
          {disconnectPostreqsOpt}
          {disconnectAllOpt}
          {deleteAndClearOpt}
        </>
      );
      break;
    case "pane":
      menuOptions = <PaneOpts contextProps={props} />;
      break;
    default:
      // eslint-disable-next-line no-console
      console.error("Invalid context target");
      return null;
  }

  return (
    <ul className="ContextMenu" style={{ top: props.xy.y, left: props.xy.x }}>
      {menuOptions}
    </ul>
  );
}
