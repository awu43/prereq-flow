import _ from "lodash";

import { buildLayerMatrix, asNonCompoundGraph } from "../util";

import { positionX } from "./bk";

function positionY(g) {
  const layering = buildLayerMatrix(g);
  const rankSep = g.graph().ranksep;
  let prevY = 0;
  _.forEach(layering, layer => {
    const maxHeight = _.max(_.map(layer, v => g.node(v).height));
    _.forEach(layer, v => {
      g.node(v).y = prevY + maxHeight / 2;
    });
    prevY += maxHeight + rankSep;
  });
}

export function position(g) {
  // eslint-disable-next-line no-param-reassign
  g = asNonCompoundGraph(g);

  positionY(g);
  _.forEach(positionX(g), (x, v) => {
    g.node(v).x = x;
  });
}
