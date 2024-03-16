import type { Edge, Node } from "./mesh";
import { omit } from "./utils";

export const prettyNodeData = <N, E>(node: Node<N, E>) =>
  Bun.inspect(omit(node, ["edges"]))
    .replaceAll("\n", " ")
    .replaceAll(/\s+/g, " ");

export const prettyEdgeData = <N, E>(edge: Edge<N, E>) =>
  Bun.inspect(omit(edge, ["from", "to"]))
    .replaceAll("\n", " ")
    .replaceAll(/\s+/g, " ");

export function logNodes<N, E>(nodes: Iterable<Node<N, E>>) {
  for (const node of nodes) {
    console.log(prettyNodeData(node));
    for (const edge of node.edges) {
      const dir = edge.from === node;
      const arrow = dir ? `->` : `<-`;
      const other = dir ? edge.to : edge.from;
      console.log(
        `| ` + prettyEdgeData(edge) + ` ` + arrow + ` ` + prettyNodeData(other),
      );
    }
    console.log();
  }
}
