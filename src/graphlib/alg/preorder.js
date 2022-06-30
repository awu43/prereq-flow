import dfs from "./dfs";

export default function preorder(g, vs) {
  return dfs(g, vs, "pre");
}
