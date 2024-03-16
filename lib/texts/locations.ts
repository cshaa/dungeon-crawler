import { randomItem } from "../rand";

const adjective = ["Large", "Purple", "Crooked", "Soaked", "Pocket-sized"];
const noun = ["Cavern", "Hall", "Hole", "Cave"];
const suffix = ["", " of Sorrows", " of Happiness", " Filled With Mice"];

export const randomLocationName = () =>
  randomItem(adjective) + " " + randomItem(noun) + randomItem(suffix);
