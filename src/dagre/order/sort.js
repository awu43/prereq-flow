import _ from "lodash";

import { partition } from "../util";

function compareWithBias(bias) {
  return function (entryV, entryW) {
    if (entryV.barycenter < entryW.barycenter) {
      return -1;
    } else if (entryV.barycenter > entryW.barycenter) {
      return 1;
    }

    return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
  };
}
function consumeUnsortable(vs, unsortable, index) {
  let last;
  // eslint-disable-next-line no-cond-assign
  while (unsortable.length && (last = _.last(unsortable)).i <= index) {
    unsortable.pop();
    vs.push(last.vs);
    // eslint-disable-next-line no-param-reassign, no-plusplus
    index++;
  }
  return index;
}

export function sort(entries, biasRight) {
  const parts = partition(entries, entry => _.has(entry, "barycenter"));
  const sortable = parts.lhs;
  const unsortable = _.sortBy(parts.rhs, entry => -entry.i);
  const vs = [];
  let sum = 0;
  let weight = 0;
  let vsIndex = 0;

  sortable.sort(compareWithBias(!!biasRight));

  vsIndex = consumeUnsortable(vs, unsortable, vsIndex);

  _.forEach(sortable, entry => {
    vsIndex += entry.vs.length;
    vs.push(entry.vs);
    sum += entry.barycenter * entry.weight;
    weight += entry.weight;
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  });

  const result = { vs: _.flatten(vs, true) };
  if (weight) {
    result.barycenter = sum / weight;
    result.weight = weight;
  }
  return result;
}
