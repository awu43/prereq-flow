import * as utils from "../utils";

function doDfs(g, v, postorder, visited, navigation, acc) {
  if (!utils.has(visited, v)) {
    visited[v] = true;

    if (!postorder) {
      acc.push(v);
    }
    navigation(v).forEach(function (w) {
      doDfs(g, w, postorder, visited, navigation, acc);
    });
    if (postorder) {
      acc.push(v);
    }
  }
}

/*
 * A helper that preforms a pre- or post-order traversal on the input graph
 * and returns the nodes in the order they were visited. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * Order must be one of "pre" or "post".
 */
export default function dfs(g, vs_, order) {
  const vs = !Array.isArray(vs_) ? [vs_] : vs_;

  const navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);

  const acc = [];
  const visited = {};
  vs.forEach(function (v) {
    if (!g.hasNode(v)) {
      throw new Error(`Graph does not have node: ${v}`);
    }

    doDfs(g, v, order === "post", visited, navigation, acc);
  });
  return acc;
}
