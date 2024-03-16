import {
  generateMesh,
  type Edge,
  type Node,
  neighbouringNodes,
  iterateNeighbourhood,
} from "./mesh.ts";
import { randomItem } from "./rand.ts";
import { randomLocationName } from "./texts/locations.ts";
import { last } from "./utils.ts";

interface InventoryItemCommon {
  name: string;
  pickable: boolean;
}

export interface InventoryKeyItem extends InventoryItemCommon {
  type: "key";
  keyFor: InventoryLockItem;
}

export interface InventoryLockItem extends InventoryItemCommon {
  type: "lock";
}

export type InventoryItem = InventoryKeyItem | InventoryLockItem;

export interface LocationData {
  name: string;
  items: InventoryItem[];
}

export interface PathData {}

export type LocationNode = Node<LocationData, PathData>;
export type LocationEdge = Edge<LocationData, PathData>;

export interface GameContext {
  location: LocationNode;
  items: InventoryItem[];
}

export interface GamePickAction {
  type: "pick";
  item: InventoryItem;
  perform(): GameState;
}

export interface GameTravelAction {
  type: "travel";
  to: LocationNode;
  via: LocationEdge;
  perform(): GameState;
}

export interface GameApplyItemAction {
  type: "apply-item";
  item: InventoryItem;
  to: InventoryItem;
  perform(): GameState;
}

export type GameAction =
  | GamePickAction
  | GameTravelAction
  | GameApplyItemAction;

export interface GameState {
  context: GameContext;
  actions: GameAction[];
}

function createState(ctx: GameContext): GameState {
  const pickActions: GamePickAction[] = ctx.location.items
    .filter(({ pickable }) => pickable)
    .map((item) => ({
      type: "pick",
      item,
      perform: () => {
        ctx.location.items.splice(ctx.location.items.indexOf(item), 1);
        return createState({
          ...ctx,
          items: [...ctx.items, item],
        });
      },
    }));

  const travelActions: GameTravelAction[] = neighbouringNodes(ctx.location).map(
    ({ node, edge }) => ({
      type: "travel",
      to: node,
      via: edge,
      perform: () => createState({ ...ctx, location: node }),
    }),
  );

  const itemActions: GameApplyItemAction[] = ctx.items.flatMap(
    (item): GameApplyItemAction[] => {
      if (item.type === "key" && ctx.location.items.includes(item.keyFor)) {
        return [
          {
            type: "apply-item",
            item,
            to: item.keyFor,
            perform: () => generateWinState(),
          },
        ];
      }
      return [];
    },
  );

  const actions = [...pickActions, ...travelActions, ...itemActions];
  return {
    context: { ...ctx },
    actions,
  };
}

function generateCave(): LocationNode {
  const mesh = generateMesh<LocationData, PathData>({
    nodeCount: 10,
    genNode: () => ({ name: randomLocationName(), items: [] }),
    genEdge: () => ({}),
    nodeWeight: ({ edges: { length } }) => [10, 5, 1][length - 1] ?? 0,
    extraEdgeMaxLength: 3,
    extraEdgeProbability: ({ edges: { length } }) =>
      [0.6, 0.3, 0.1][length - 1] ?? 0,
    extraEdgeWeight: (_, { edges: { length } }, dist) =>
      ([10, 5, 1][length - 1] ?? 0) * ([3, 2, 1][dist] ?? 0),
  });

  const location = [...mesh.nodes][0];

  const lock: InventoryLockItem = {
    type: "lock",
    name: "Exit Door",
    pickable: false,
  };
  const key: InventoryKeyItem = {
    type: "key",
    name: "Almighty Key of Escapes",
    pickable: true,
    keyFor: lock,
  };

  const distances = [...iterateNeighbourhood(location)];

  const midpoint = randomItem(distances[Math.floor(distances.length / 2)]);
  midpoint.items.push(lock);

  const furthestPoint = randomItem(last(distances)!);
  furthestPoint.items.push(key);

  return location;
}

function generateWinState(): GameState {
  return {
    context: {
      items: [],
      location: { name: "You Won The Game", edges: [], items: [] },
    },
    actions: [],
  };
}

export function startGame(): GameState {
  const location = generateCave();
  return createState({ location, items: [] });
}
