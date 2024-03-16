import {
  generateMesh,
  type Edge,
  type Node,
  neighbouringNodes,
} from "./mesh.ts";
import { randomLocationName } from "./texts/locations.ts";

export interface LocationData {
  name: string;
}

export interface PathData {}

export type LocationNode = Node<LocationData, PathData>;
export type LocationEdge = Edge<LocationData, PathData>;

export interface GameContext {
  location: LocationNode;
}

export interface GameTravelAction {
  type: "travel";
  to: LocationNode;
  via: LocationEdge;
  perform(): GameState;
}

export type GameAction = GameTravelAction;

export interface GameState {
  context: GameContext;
  actions: GameAction[];
}

function createState(location: LocationNode): GameState {
  return {
    context: { location },
    actions: neighbouringNodes(location).map(({ node, edge }) => ({
      type: "travel",
      to: node,
      via: edge,
      perform: () => createState(node),
    })),
  };
}

export function startGame(): GameState {
  const mesh = generateMesh<LocationData, PathData>({
    nodeCount: 10,
    genNode: () => ({ name: randomLocationName() }),
    genEdge: () => ({}),
    nodeWeight: ({ edges: { length } }) => [10, 5, 1][length - 1] ?? 0,
    extraEdgeMaxLength: 3,
    extraEdgeProbability: ({ edges: { length } }) =>
      [0.6, 0.3, 0.1][length - 1] ?? 0,
    extraEdgeWeight: (_, { edges: { length } }, dist) =>
      ([10, 5, 1][length - 1] ?? 0) * ([3, 2, 1][dist] ?? 0),
  });

  const location = [...mesh.nodes][0];

  return createState(location);
}
