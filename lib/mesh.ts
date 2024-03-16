import { omit } from "./utils";

export interface Mesh<N, E> {
  nodes: Set<Node<N, E>>;
}

export type Node<N, E> = N & {
  edges: Edge<N, E>[];
};

export type Edge<N, E> = E & {
  from: Node<N, E>;
  to: Node<N, E>;
};

export function neighbouringNodes<N, E>(
  subject: Node<N, E>,
): { node: Node<N, E>; edge: Edge<N, E>; direction: "to" | "from" }[] {
  return subject.edges.map((edge) => {
    const [node, direction] =
      edge.from === subject
        ? [edge.to, <const>"to"]
        : [edge.from, <const>"from"];

    return { edge, node, direction };
  });
}

export function newNode<N, E>(nodeData: N): Node<N, E> {
  return {
    ...nodeData,
    edges: [],
  };
}

export function appendNode<N, E>({
  mesh,
  nodeToAppend,
  where,
  edgeData,
  direction,
}: {
  mesh: Mesh<N, E>;
  nodeToAppend: Node<N, E>;
  where: Node<N, E>;
  edgeData: E;
  direction?: "from" | "to";
}) {
  direction ??= "to";
  const edge = {
    ...edgeData,
    from: direction === "from" ? nodeToAppend : where,
    to: direction === "to" ? nodeToAppend : where,
  };
  nodeToAppend.edges.push(edge);
  where.edges.push(edge);
  mesh.nodes.add(nodeToAppend);
}

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

type NodeData = { name: string };
type EdgeData = {};

const rootNode = newNode<NodeData, EdgeData>({ name: "root" });
const tootNode = newNode<NodeData, EdgeData>({ name: "toot" });

const mesh: Mesh<NodeData, EdgeData> = {
  nodes: new Set([rootNode]),
};

appendNode({
  mesh,
  edgeData: {},
  nodeToAppend: tootNode,
  where: rootNode,
});

logNodes(mesh.nodes);
