import * as utils from "./utils";

const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

function incrementOrInitEntry(map, k) {
  if (map[k]) {
    map[k] += 1;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map, k) {
  map[k] -= 1;
  if (!map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected, v_, w_, name) {
  let v = String(v_);
  let w = String(w_);
  if (!isDirected && v > w) {
    [v, w] = [w, v];
  }
  return [v, w, name === undefined ? DEFAULT_EDGE_NAME : name].join(
    EDGE_KEY_DELIM
  );
}

function edgeArgsToObj(isDirected, v_, w_, name) {
  let v = String(v_);
  let w = String(w_);
  if (!isDirected && v > w) {
    [v, w] = [w, v];
  }
  const edgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected, edgeObj) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.

export default function Graph(opts) {
  this._isDirected = utils.has(opts, "directed") ? opts.directed : true;
  this._isMultigraph = utils.has(opts, "multigraph") ? opts.multigraph : false;
  this._isCompound = utils.has(opts, "compound") ? opts.compound : false;

  // Label for the graph itself
  this._label = undefined;

  // Defaults to be set when creating a new node
  this._defaultNodeLabelFn = () => undefined;

  // Defaults to be set when creating a new edge
  this._defaultEdgeLabelFn = () => undefined;

  // v -> label
  this._nodes = {};

  if (this._isCompound) {
    // v -> parent
    this._parent = {};

    // v -> children
    this._children = {};
    this._children[GRAPH_NODE] = {};
  }

  // v -> edgeObj
  this._in = {};

  // u -> v -> Number
  this._preds = {};

  // v -> edgeObj
  this._out = {};

  // v -> w -> Number
  this._sucs = {};

  // e -> edgeObj
  this._edgeObjs = {};

  // e -> label
  this._edgeLabels = {};
}

/* Number of nodes in the graph. Should only be changed by the implementation. */
Graph.prototype._nodeCount = 0;

/* Number of edges in the graph. Should only be changed by the implementation. */
Graph.prototype._edgeCount = 0;

/* === Graph functions ========= */

Graph.prototype.isDirected = function () {
  return this._isDirected;
};

Graph.prototype.isMultigraph = function () {
  return this._isMultigraph;
};

Graph.prototype.isCompound = function () {
  return this._isCompound;
};

Graph.prototype.setGraph = function (label) {
  this._label = label;
  return this;
};

Graph.prototype.graph = function () {
  return this._label;
};

/* === Node functions ========== */

Graph.prototype.setDefaultNodeLabel = function (newDefault) {
  this._defaultNodeLabelFn =
    typeof newDefault !== "function" ? () => newDefault : newDefault;
  return this;
};

Graph.prototype.nodeCount = function () {
  return this._nodeCount;
};

Graph.prototype.nodes = function () {
  return Object.keys(this._nodes);
};

Graph.prototype.sources = function () {
  const self = this;
  return this.nodes().filter(function (v) {
    return utils.isEmpty(self._in[v]);
  });
};

Graph.prototype.sinks = function () {
  const self = this;
  return this.nodes().filter(function (v) {
    return utils.isEmpty(self._out[v]);
  });
};

// setNodes(vs, value)
Graph.prototype.setNodes = function (...args) {
  const [vs, value] = args;
  const self = this;
  vs.forEach(function (v) {
    if (args.length > 1) {
      self.setNode(v, value);
    } else {
      self.setNode(v);
    }
  });
  return this;
};

Graph.prototype.setNode = function (v, value) {
  if (utils.has(this._nodes, v)) {
    if (arguments.length > 1) {
      this._nodes[v] = value;
    }
    return this;
  }

  this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
  if (this._isCompound) {
    this._parent[v] = GRAPH_NODE;
    this._children[v] = {};
    this._children[GRAPH_NODE][v] = true;
  }
  this._in[v] = {};
  this._preds[v] = {};
  this._out[v] = {};
  this._sucs[v] = {};
  this._nodeCount += 1;
  return this;
};

Graph.prototype.node = function (v) {
  return this._nodes[v];
};

Graph.prototype.hasNode = function (v) {
  return utils.has(this._nodes, v);
};

Graph.prototype.removeNode = function (v) {
  const self = this;
  if (utils.has(this._nodes, v)) {
    const removeEdge = function (e) {
      self.removeEdge(self._edgeObjs[e]);
    };
    delete this._nodes[v];
    if (this._isCompound) {
      this._removeFromParentsChildList(v);
      delete this._parent[v];
      this.children(v).forEach(function (child) {
        self.setParent(child);
      });
      delete this._children[v];
    }
    Object.keys(this._in[v]).forEach(removeEdge);
    delete this._in[v];
    delete this._preds[v];
    Object.keys(this._out[v]).forEach(removeEdge);
    delete this._out[v];
    delete this._sucs[v];
    this._nodeCount -= 1;
  }
  return this;
};

Graph.prototype.setParent = function (v, parent_) {
  if (!this._isCompound) {
    throw new Error("Cannot set parent in a non-compound graph");
  }

  let parent = parent_;
  if (parent === undefined) {
    parent = GRAPH_NODE;
  } else {
    // Coerce parent to string
    parent = String(parent);
    // TODO: Refactor this recursive search
    for (
      let ancestor = parent;
      ancestor !== undefined;
      ancestor = this.parent(ancestor)
    ) {
      if (ancestor === v) {
        throw new Error(
          `Setting ${parent} as parent of ${v} would create a cycle`
        );
      }
    }

    this.setNode(parent);
  }

  this.setNode(v);
  this._removeFromParentsChildList(v);
  this._parent[v] = parent;
  this._children[parent][v] = true;
  return this;
};

Graph.prototype._removeFromParentsChildList = function (v) {
  delete this._children[this._parent[v]][v];
};

Graph.prototype.parent = function (v) {
  if (this._isCompound) {
    const parent = this._parent[v];
    if (parent !== GRAPH_NODE) {
      return parent;
    }
  }
};

Graph.prototype.children = function (v_) {
  const v = v_ === undefined ? GRAPH_NODE : v_;

  if (this._isCompound) {
    const children = this._children[v];
    if (children) {
      return Object.keys(children);
    }
  } else if (v === GRAPH_NODE) {
    return this.nodes();
  } else if (this.hasNode(v)) {
    return [];
  }
};

Graph.prototype.predecessors = function (v) {
  const predsV = this._preds[v];
  if (predsV) {
    return Object.keys(predsV);
  }
};

Graph.prototype.successors = function (v) {
  const sucsV = this._sucs[v];
  if (sucsV) {
    return Object.keys(sucsV);
  }
};

Graph.prototype.neighbors = function (v) {
  const preds = this.predecessors(v);
  if (preds) {
    return utils.union(preds, this.successors(v));
  }
};

Graph.prototype.isLeaf = function (v) {
  let neighbors;
  if (this.isDirected()) {
    neighbors = this.successors(v);
  } else {
    neighbors = this.neighbors(v);
  }
  return neighbors.length === 0;
};

Graph.prototype.filterNodes = function (filter) {
  const copy = new this.constructor({
    directed: this._isDirected,
    multigraph: this._isMultigraph,
    compound: this._isCompound,
  });

  copy.setGraph(this.graph());

  const self = this;
  Object.entries(this._nodes).forEach(function ([v, value]) {
    if (filter(v)) {
      copy.setNode(v, value);
    }
  });

  Object.values(this._edgeObjs).forEach(function (e) {
    if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
      copy.setEdge(e, self.edge(e));
    }
  });

  const parents = {};
  function findParent(v) {
    const parent = self.parent(v);
    if (parent === undefined || copy.hasNode(parent)) {
      parents[v] = parent;
      return parent;
    } else if (parent in parents) {
      return parents[parent];
    } else {
      return findParent(parent);
    }
  }

  if (this._isCompound) {
    copy.nodes().forEach(function (v) {
      copy.setParent(v, findParent(v));
    });
  }

  return copy;
};

/* === Edge functions ========== */

Graph.prototype.setDefaultEdgeLabel = function (newDefault) {
  this._defaultEdgeLabelFn =
    typeof newDefault !== "function" ? () => newDefault : newDefault;
  return this;
};

Graph.prototype.edgeCount = function () {
  return this._edgeCount;
};

Graph.prototype.edges = function () {
  return Object.values(this._edgeObjs);
};

/*
 * setPath(vs, value)
 */
Graph.prototype.setPath = function (...args) {
  const [vs, value] = args;
  const self = this;
  vs.reduce(function (v, w) {
    if (args.length > 1) {
      self.setEdge(v, w, value);
    } else {
      self.setEdge(v, w);
    }
    return w;
  });
  return this;
};

/*
 * setEdge(v, w, [value, [name]])
 * setEdge({ v, w, [name] }, [value])
 */
Graph.prototype.setEdge = function (...args) {
  let v;
  let w;
  let name;
  let value;
  let valueSpecified = false;
  const arg0 = args[0];

  /* eslint-disable prefer-destructuring */
  if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
    v = arg0.v;
    w = arg0.w;
    name = arg0.name;
    if (args.length === 2) {
      value = args[1];
      valueSpecified = true;
    }
  } else {
    v = arg0;
    w = args[1];
    name = args[3];
    if (args.length > 2) {
      value = args[2];
      valueSpecified = true;
    }
  }
  /* eslint-enable prefer-destructuring */
  // TODO: Fix this later

  v = String(v);
  w = String(w);
  if (name !== undefined) {
    name = String(name);
  }

  const e = edgeArgsToId(this._isDirected, v, w, name);
  if (utils.has(this._edgeLabels, e)) {
    if (valueSpecified) {
      this._edgeLabels[e] = value;
    }
    return this;
  }

  if (name !== undefined && !this._isMultigraph) {
    throw new Error("Cannot set a named edge when isMultigraph = false");
  }

  // It didn't exist, so we need to create it.
  // First ensure the nodes exist.
  this.setNode(v);
  this.setNode(w);

  this._edgeLabels[e] = valueSpecified
    ? value
    : this._defaultEdgeLabelFn(v, w, name);

  const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
  // Ensure we add undirected edges in a consistent way.
  v = edgeObj.v;
  w = edgeObj.w;

  Object.freeze(edgeObj);
  this._edgeObjs[e] = edgeObj;
  incrementOrInitEntry(this._preds[w], v);
  incrementOrInitEntry(this._sucs[v], w);
  this._in[w][e] = edgeObj;
  this._out[v][e] = edgeObj;
  this._edgeCount += 1;
  return this;
};

Graph.prototype.edge = function (v, w, name) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, v)
      : edgeArgsToId(this._isDirected, v, w, name);
  return this._edgeLabels[e];
};

Graph.prototype.hasEdge = function (v, w, name) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, v)
      : edgeArgsToId(this._isDirected, v, w, name);
  return utils.has(this._edgeLabels, e);
};

Graph.prototype.removeEdge = function (v, w, name) {
  const e =
    arguments.length === 1
      ? edgeObjToId(this._isDirected, v)
      : edgeArgsToId(this._isDirected, v, w, name);
  const edge = this._edgeObjs[e];
  if (edge) {
    const { v: v_, w: w_ } = edge;
    delete this._edgeLabels[e];
    delete this._edgeObjs[e];
    decrementOrRemoveEntry(this._preds[w_], v_);
    decrementOrRemoveEntry(this._sucs[v_], w_);
    delete this._in[w_][e];
    delete this._out[v_][e];
    this._edgeCount -= 1;
  }
  return this;
};

Graph.prototype.inEdges = function (v, u) {
  const inV = this._in[v];
  if (inV) {
    const edges = Object.values(inV);
    if (!u) {
      return edges;
    }
    return edges.filter(function (edge) {
      return edge.v === u;
    });
  }
};

Graph.prototype.outEdges = function (v, w) {
  const outV = this._out[v];
  if (outV) {
    const edges = Object.values(outV);
    if (!w) {
      return edges;
    }
    return edges.filter(function (edge) {
      return edge.w === w;
    });
  }
};

Graph.prototype.nodeEdges = function (v, w) {
  const inEdges = this.inEdges(v, w);
  if (inEdges) {
    return inEdges.concat(this.outEdges(v, w));
  }
};
