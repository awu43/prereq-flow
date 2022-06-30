import Graph from "./graph";

export function read(json) {
  const g = new Graph(json.options).setGraph(json.value);
  json.nodes.forEach(function (entry) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  json.edges.forEach(function (entry) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}

function writeNodes(g) {
  return g.nodes().map(function (v) {
    const nodeValue = g.node(v);
    const parent = g.parent(v);
    const node = { v };
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g) {
  return g.edges().map(function (e) {
    const edgeValue = g.edge(e);
    const edge = { v: e.v, w: e.w };
    if (e.name !== undefined) {
      edge.name = e.name;
    }
    if (edgeValue !== undefined) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

export function write(g) {
  const json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound(),
    },
    nodes: writeNodes(g),
    edges: writeEdges(g),
  };
  if (g.graph() !== undefined) {
    json.value = JSON.parse(JSON.stringify(g.graph()));
  }
  return json;
}
