import * as utils from "../utils";
import Graph from "../graph";
import PriorityQueue from "../data/priority-queue";

export default function prim(g, weightFunc) {
  const result = new Graph();
  const parents = {};
  const pq = new PriorityQueue();
  let v;

  function updateNeighbors(edge) {
    const w = edge.v === v ? edge.w : edge.v;
    const pri = pq.priority(w);
    if (pri !== undefined) {
      const edgeWeight = weightFunc(edge);
      if (edgeWeight < pri) {
        parents[w] = v;
        pq.decrease(w, edgeWeight);
      }
    }
  }

  if (g.nodeCount() === 0) {
    return result;
  }

  g.nodes().forEach(function (v_) {
    pq.add(v_, Number.POSITIVE_INFINITY);
    result.setNode(v_);
  });

  // Start from an arbitrary node
  pq.decrease(g.nodes()[0], 0);

  let init = false;
  while (pq.size() > 0) {
    v = pq.removeMin();
    if (utils.has(parents, v)) {
      result.setEdge(v, parents[v]);
    } else if (init) {
      throw new Error(`Input graph is not connected: ${g}`);
    } else {
      init = true;
    }

    g.nodeEdges(v).forEach(updateNeighbors);
  }

  return result;
}
