import _ from "lodash";

import { greedyFAS } from "./greedy-fas";

function dfsFAS(g) {
  const fas = [];
  const stack = {};
  const visited = {};

  function dfs(v) {
    if (_.has(visited, v)) {
      return;
    }
    visited[v] = true;
    stack[v] = true;
    _.forEach(g.outEdges(v), e => {
      if (_.has(stack, e.w)) {
        fas.push(e);
      } else {
        dfs(e.w);
      }
    });
    delete stack[v];
  }

  _.forEach(g.nodes(), dfs);
  return fas;
}

export function run(g) {
  function weightFn(g_) {
    return function (e) {
      return g_.edge(e).weight;
    };
  }

  const fas =
    g.graph().acyclicer === "greedy" ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
  _.forEach(fas, e => {
    const label = g.edge(e);
    g.removeEdge(e);
    label.forwardName = e.name;
    label.reversed = true;
    g.setEdge(e.w, e.v, label, _.uniqueId("rev"));
  });
}

export function undo(g) {
  _.forEach(g.edges(), e => {
    const label = g.edge(e);
    if (label.reversed) {
      g.removeEdge(e);

      const { forwardName } = label;
      delete label.reversed;
      delete label.forwardName;
      g.setEdge(e.w, e.v, label, forwardName);
    }
  });
}
