import Graph from "../../graphlib";
import _ from "lodash";

import { maxRank, buildLayerMatrix } from "../util";

import { addSubgraphConstraints } from "./add-subgraph-constraints";
import { buildLayerGraph } from "./build-layer-graph";
import { crossCount } from "./cross-count";
import { initOrder } from "./init-order";
import { sortSubgraph } from "./sort-subgraph";

function buildLayerGraphs(g, ranks, relationship) {
  return _.map(ranks, rank => buildLayerGraph(g, rank, relationship));
}

function assignOrder(g, layering) {
  _.forEach(layering, layer => {
    _.forEach(layer, (v, i) => {
      g.node(v).order = i;
    });
  });
}

function sweepLayerGraphs(layerGraphs, biasRight) {
  const cg = new Graph();
  _.forEach(layerGraphs, lg => {
    const { root } = lg.graph();
    const sorted = sortSubgraph(lg, root, cg, biasRight);
    _.forEach(sorted.vs, (v, i) => {
      lg.node(v).order = i;
    });
    addSubgraphConstraints(lg, cg, sorted.vs);
  });
}

/*
 * Applies heuristics to minimize edge crossings in the graph and sets the best
 * order solution as an order attribute on each node.
 *
 * Pre-conditions:
 *
 *    1. Graph must be DAG
 *    2. Graph nodes must be objects with a "rank" attribute
 *    3. Graph edges must have the "weight" attribute
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have an "order" attribute based on the results of the
 *       algorithm.
 */
export function order(g) {
  const maxRank_ = maxRank(g);
  const downLayerGraphs = buildLayerGraphs(
    g,
    _.range(1, maxRank_ + 1),
    "inEdges"
  );
  const upLayerGraphs = buildLayerGraphs(
    g,
    _.range(maxRank_ - 1, -1, -1),
    "outEdges"
  );

  let layering = initOrder(g);
  assignOrder(g, layering);

  let bestCC = Number.POSITIVE_INFINITY;
  let best;

  for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
    sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);

    layering = buildLayerMatrix(g);
    const cc = crossCount(g, layering);
    if (cc < bestCC) {
      lastBest = 0;
      best = _.cloneDeep(layering);
      bestCC = cc;
    }
  }

  assignOrder(g, best);
}
