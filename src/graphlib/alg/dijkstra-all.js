import * as utils from "../utils";
import dijkstra from "./dijkstra";

export default function dijkstraAll(g, weightFunc, edgeFunc) {
  return utils.transform(
    g.nodes(),
    function (acc, v) {
      acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
    },
    {}
  );
}
