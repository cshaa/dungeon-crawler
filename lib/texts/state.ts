import type { GameAction, GameState } from "../game";
import { neighbouringNodes } from "../mesh";

export const describeState = (state: GameState) => {
  const { location } = state.context;

  let str = `You are in the ${location.name}.`;

  for (const item of location.items) {
    str += `\nThere is ${item.name}${item.pickable ? ` laying on the ground` : ``}.`;
  }

  for (const { node } of neighbouringNodes(location)) {
    str += `\nA path leads to ${node.name}`;
    if (node.items.some(({ type }) => type === "key")) {
      str += `; you can see something shiny on the ground there`;
    }
    if (node.items.some(({ type }) => type === "lock")) {
      str += `; you feel fresh breeze blowing from there`;
    }
    str += `.`;
  }

  return str;
};

export const describeAction = (action: GameAction) => {
  switch (action.type) {
    case "pick":
      return `Take ${action.item.name}`;
    case "travel":
      return `Go to ${action.to.name}.`;
    case "apply-item":
      switch (action.item.type) {
        case "key":
          return `Use ${action.item.name} to unlock ${action.to.name}.`;
        case "lock":
          return `Use ${action.item.name} to do something with ${action.to.name} I guess?`;
      }
  }
};
