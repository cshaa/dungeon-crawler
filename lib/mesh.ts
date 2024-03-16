import { logNodes } from "./log";
import { randomItem } from "./rand";
import { range } from "./range";

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

export function newMesh<N, E>(nodes: Iterable<Node<N, E>>): Mesh<N, E> {
  return { nodes: new Set(nodes) };
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
  direction ??= "from";
  const edge = {
    ...edgeData,
    from: direction === "from" ? nodeToAppend : where,
    to: direction === "to" ? nodeToAppend : where,
  };
  nodeToAppend.edges.push(edge);
  where.edges.push(edge);
  mesh.nodes.add(nodeToAppend);
}

export function generateMesh<N, E>({
  nodeCount,
  genNode,
  genEdge,
  nodeWeight,
  extraEdgeWeight,
}: {
  nodeCount: number;
  genNode: (index: number) => N;
  genEdge: (from: Node<N, E>, to: Node<N, E>) => E;
  nodeWeight: (node: Node<N, E>) => number;
  extraEdgeWeight: (to: Node<N, E>) => number;
}): Mesh<N, E> {
  const root = newNode<N, E>(genNode(0));
  const mesh = newMesh([root]);

  for (const i of range(1, nodeCount)) {
    const stem = randomItem([...mesh.nodes], nodeWeight);
    const node = newNode<N, E>(genNode(i));
    const edgeData = genEdge(node, stem);

    appendNode({
      mesh,
      edgeData,
      nodeToAppend: node,
      where: stem,
    });
  }

  return mesh;
}

type NodeData = { name: number };
type EdgeData = {};

const mesh = generateMesh<NodeData, EdgeData>({
  nodeCount: 10,
  genNode: (i) => ({ name: i }),
  genEdge: () => ({}),
  nodeWeight: ({ edges: { length } }) => [10, 5, 1][length - 1] ?? 0,
  extraEdgeWeight: () => 0,
});

logNodes(mesh.nodes);
