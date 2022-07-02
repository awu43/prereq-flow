import _ from "lodash";

function swapWidthHeightOne(attrs) {
  const w = attrs.width;
  attrs.width = attrs.height;
  attrs.height = w;
}

function swapWidthHeight(g) {
  _.forEach(g.nodes(), v => {
    swapWidthHeightOne(g.node(v));
  });
  _.forEach(g.edges(), e => {
    swapWidthHeightOne(g.edge(e));
  });
}

export function adjust(g) {
  const rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "lr" || rankDir === "rl") {
    swapWidthHeight(g);
  }
}

function reverseYOne(attrs) {
  attrs.y = -attrs.y;
}

function reverseY(g) {
  _.forEach(g.nodes(), v => {
    reverseYOne(g.node(v));
  });

  _.forEach(g.edges(), e => {
    const edge = g.edge(e);
    _.forEach(edge.points, reverseYOne);
    if (_.has(edge, "y")) {
      reverseYOne(edge);
    }
  });
}

function swapXYOne(attrs) {
  const { x } = attrs;
  attrs.x = attrs.y;
  attrs.y = x;
}

function swapXY(g) {
  _.forEach(g.nodes(), v => {
    swapXYOne(g.node(v));
  });

  _.forEach(g.edges(), e => {
    const edge = g.edge(e);
    _.forEach(edge.points, swapXYOne);
    if (_.has(edge, "x")) {
      swapXYOne(edge);
    }
  });
}

export function undo(g) {
  const rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "bt" || rankDir === "rl") {
    reverseY(g);
  }

  if (rankDir === "lr" || rankDir === "rl") {
    swapXY(g);
    swapWidthHeight(g);
  }
}
