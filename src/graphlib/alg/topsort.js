import * as utils from "../utils";

function CycleException() {}
CycleException.prototype = new Error();
// must be an instance of Error to pass testing

export default function topsort(g) {
  const visited = {};
  const stack = {};
  const results = [];

  function visit(node) {
    if (utils.has(stack, node)) {
      throw new CycleException();
    }

    if (!utils.has(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      g.predecessors(node).forEach(visit);
      delete stack[node];
      results.push(node);
    }
  }

  g.sinks().forEach(visit);

  if (Object.keys(visited).length !== g.nodeCount()) {
    throw new CycleException();
  }

  return results;
}
topsort.CycleException = CycleException;
