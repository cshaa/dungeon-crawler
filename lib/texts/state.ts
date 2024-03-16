import type { GameAction, GameState } from "../game";

export const describeState = (state: GameState) =>
  `You are in the ${state.context.location.name}.`;

export const describeAction = (action: GameAction) =>
  `Go to the ${action.to.name}.`;
