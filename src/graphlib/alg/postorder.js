import dfs from "./dfs";

export default function postorder(g, vs) {
  return dfs(g, vs, "post");
}
