import { startGame } from "./lib/game";
import { describeAction, describeState } from "./lib/texts/state";

console.log("(in a foreign accent) Welcome, traveller!");
console.log();

let game = startGame();

game: while (true) {
  console.log(describeState(game));
  for (const [i, action] of game.actions.entries()) {
    console.log(`${i + 1}) ${describeAction(action)}`);
  }

  for await (const answer of console) {
    console.log();
    if (answer.trim() === "exit") break game;

    if (!/\s*\d+\s*/.test(answer)) {
      console.error("Please enter a number!");
      continue;
    }

    const i = parseInt(answer) - 1;
    const action = game.actions[i];

    if (!action) {
      console.error("Invalid action");
      continue;
    }

    game = action.perform();
    break;
  }
}
