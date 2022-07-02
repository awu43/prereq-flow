import type { Node } from "types/main";
import type { OptListProps } from "types/ContextMenu";

export default function ConditionalNodeOpts({
  contextProps,
  sharedOpts,
}: OptListProps): JSX.Element {
  const { elements, nodeData, data, rerouteSingle, reroutePointless } =
    contextProps;
  const {
    disconnectPrereqsOpt,
    disconnectPostreqsOpt,
    disconnectAllOpt,

    deleteElemsOpt,
  } = sharedOpts;

  const { target } = data;

  const hasPrereqs = !!nodeData.get(target[0]).incomingEdges.length;
  const hasPostreqs = !!nodeData.get(target[0]).outgoingEdges.length;
  let pointlessOrNodeFound = false;
  const numNodes = nodeData.size;
  for (let i = 0; i < numNodes; i++) {
    const elem = elements[i] as Node;
    if (elem.type === "or" && nodeData.get(elem.id).incomingEdges.length <= 1) {
      pointlessOrNodeFound = true;
      break;
    }
  }
  const rerouteSingleOpt = (
    <li className="reroute" onClick={() => rerouteSingle(target[0])}>
      <p>Reroute</p>
    </li>
  );
  const reroutePointlessOpt = (
    <li onClick={reroutePointless}>
      <p>Reroute pointless OR nodes</p>
    </li>
  );

  return (
    <>
      {hasPrereqs && disconnectPrereqsOpt}
      {hasPostreqs && disconnectPostreqsOpt}
      {hasPrereqs && hasPostreqs && disconnectAllOpt}
      {hasPrereqs && hasPostreqs && rerouteSingleOpt}
      {pointlessOrNodeFound && reroutePointlessOpt}
      {deleteElemsOpt}
    </>
  );
}
