import type { Node } from "types/main";
import type { OptListProps } from "types/ContextMenu";

export default function PaneOpts({
  contextProps,
}: Omit<OptListProps, "sharedOpts">): JSX.Element {
  const { elements, nodeData, xy, newConditionalNode, reroutePointless } =
    contextProps;

  let pointlessOrNodeFound = false;
  const numNodes = nodeData.size;
  for (let i = 0; i < numNodes; i++) {
    const elem = elements[i] as Node;
    if (elem.type === "or" && nodeData.get(elem.id).incomingEdges.length <= 1) {
      pointlessOrNodeFound = true;
      break;
    }
  }
  const reroutePointlessOpt = (
    <li onClick={reroutePointless}>
      <p>Reroute pointless OR nodes</p>
    </li>
  );

  return (
    <>
      <li onClick={() => newConditionalNode("or", xy)}>
        <p>New OR node</p>
      </li>
      <li onClick={() => newConditionalNode("and", xy)}>
        <p>New AND node</p>
      </li>
      {pointlessOrNodeFound && reroutePointlessOpt}
    </>
  );
}
