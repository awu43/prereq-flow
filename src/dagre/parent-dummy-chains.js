import _ from "lodash";

function postorder(g) {
  const result = {};
  let lim = 0;

  function dfs(v) {
    const low = lim;
    _.forEach(g.children(v), dfs);
    lim += 1;
    result[v] = { low, lim };
  }
  _.forEach(g.children(), dfs);

  return result;
}

// Find a path from v to w through the lowest common ancestor (LCA). Return the
// full path and the LCA.
function findPath(g, postorderNums, v, w) {
  const vPath = [];
  const wPath = [];
  const low = Math.min(postorderNums[v].low, postorderNums[w].low);
  const lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);

  // Traverse up from v to find the LCA
  let parent = v;
  do {
    parent = g.parent(parent);
    vPath.push(parent);
  } while (
    parent &&
    (postorderNums[parent].low > low || lim > postorderNums[parent].lim)
  );
  const lca = parent;

  // Traverse from w to LCA
  parent = w;
  // eslint-disable-next-line no-cond-assign
  while ((parent = g.parent(parent)) !== lca) {
    wPath.push(parent);
  }

  return { path: vPath.concat(wPath.reverse()), lca };
}

export function parentDummyChains(g) {
  const postorderNums = postorder(g);

  _.forEach(g.graph().dummyChains, v => {
    let node = g.node(v);
    const { edgeObj } = node;
    const pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
    const { path } = pathData;
    const { lca } = pathData;
    let pathIdx = 0;
    let pathV = path[pathIdx];
    let ascending = true;

    while (v !== edgeObj.w) {
      node = g.node(v);

      if (ascending) {
        while (
          // eslint-disable-next-line no-cond-assign
          (pathV = path[pathIdx]) !== lca &&
          g.node(pathV).maxRank < node.rank
        ) {
          pathIdx += 1;
        }

        if (pathV === lca) {
          ascending = false;
        }
      }

      if (!ascending) {
        while (
          pathIdx < path.length - 1 &&
          // eslint-disable-next-line no-cond-assign
          g.node((pathV = path[pathIdx + 1])).minRank <= node.rank
        ) {
          pathIdx += 1;
        }
        pathV = path[pathIdx];
      }

      g.setParent(v, pathV);
      // eslint-disable-next-line prefer-destructuring, no-param-reassign
      v = g.successors(v)[0];
    }
  });
}
