import PriorityQueue from "../data/priority-queue";

const DEFAULT_WEIGHT_FUNC = () => 1;

function runDijkstra(g, source, weightFn, edgeFn) {
  const results = {};
  const pq = new PriorityQueue();
  let v;
  let vEntry;

  const updateNeighbors = function (edge) {
    const w = edge.v !== v ? edge.v : edge.w;
    const wEntry = results[w];
    const weight = weightFn(edge);
    const distance = vEntry.distance + weight;

    if (weight < 0) {
      throw new Error(
        `dijkstra does not allow negative edge weights. Bad edge: ${edge} Weight: ${weight}`
      );
    }

    if (distance < wEntry.distance) {
      wEntry.distance = distance;
      wEntry.predecessor = v;
      pq.decrease(w, distance);
    }
  };

  g.nodes().forEach(function (v2) {
    const distance = v2 === source ? 0 : Number.POSITIVE_INFINITY;
    results[v2] = { distance };
    pq.add(v2, distance);
  });

  while (pq.size() > 0) {
    v = pq.removeMin();
    vEntry = results[v];
    if (vEntry.distance === Number.POSITIVE_INFINITY) {
      break;
    }

    edgeFn(v).forEach(updateNeighbors);
  }

  return results;
}

export default function dijkstra(g, source, weightFn, edgeFn) {
  return runDijkstra(
    g,
    String(source),
    weightFn || DEFAULT_WEIGHT_FUNC,
    edgeFn ||
      function (v) {
        return g.outEdges(v);
      }
  );
}
