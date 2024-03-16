import { logNodes } from "./log.ts";
import { randomItem } from "./rand.ts";
import { range, skip, take } from "./utils.ts";

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

export function connect<N, E>({
  from,
  to,
  edgeData,
}: {
  from: Node<N, E>;
  to: Node<N, E>;
  edgeData: E;
}) {
  const edge = {
    ...edgeData,
    from,
    to,
  };
  from.edges.push(edge);
  to.edges.push(edge);
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
  connect({
    edgeData,
    from: direction === "from" ? nodeToAppend : where,
    to: direction === "to" ? nodeToAppend : where,
  });
  mesh.nodes.add(nodeToAppend);
}

export function* iterateNeighbourhood<N, E>(
  node: Node<N, E>,
): Iterable<Node<N, E>[]> {
  const visited = new Set([node]);
  let newlyFound: Node<N, E>[] = [node];

  while (newlyFound.length > 0) {
    const next = newlyFound
      .map(({ edges }) => edges.map(({ from, to }) => [from, to]))
      .flat(2);

    newlyFound = [];

    for (const n of next) {
      if (!visited.has(n)) {
        newlyFound.push(n);
        visited.add(n);
      }
    }

    yield [...newlyFound];
  }
}

export function generateMesh<N, E>({
  nodeCount,
  rootNode,
  genNode,
  genEdge,
  nodeWeight,
  extraEdgeProbability,
  extraEdgeMaxLength,
  extraEdgeWeight,
}: {
  nodeCount: number;
  rootNode?: Node<N, E>;
  genNode: (index: number) => N;
  genEdge: (from: Node<N, E>, to: Node<N, E>) => E;
  nodeWeight: (node: Node<N, E>) => number;
  extraEdgeProbability: (node: Node<N, E>) => number;
  extraEdgeMaxLength: number;
  extraEdgeWeight: (from: Node<N, E>, to: Node<N, E>, dist: number) => number;
}): Mesh<N, E> {
  rootNode ??= newNode<N, E>(genNode(0));
  const mesh = newMesh([rootNode]);

  for (const i of range(1, nodeCount)) {
    const otherMeshNodes = [...mesh.nodes];
    const stem = randomItem(otherMeshNodes, nodeWeight);
    const node = newNode<N, E>(genNode(i));
    const edgeData = genEdge(node, stem);

    appendNode({
      mesh,
      edgeData,
      nodeToAppend: node,
      where: stem,
    });

    while (Math.random() < extraEdgeProbability(node)) {
      const layers = [
        ...skip(take(iterateNeighbourhood(node), extraEdgeMaxLength), 1),
      ];
      const weighted = layers.flatMap((l, i) =>
        l.map((n): [Node<N, E>, number] => [
          n,
          extraEdgeWeight(node, n, i + 1),
        ]),
      );
      if (weighted.length === 0) break;
      const other = randomItem(weighted, ([node, weight]) => weight)[0];
      connect({
        from: other,
        to: node,
        edgeData: undefined,
      });
    }
  }

  return mesh;
}
