import { PlayerApi } from "./models";

export const isGoingUp = (player: PlayerApi) => {
  const velocity = player.velocity.get();
  return +velocity[1].toFixed(2) > 0;
};

export const isGoingDown = (player: PlayerApi) => {
  const velocity = player.velocity.get();
  return +velocity[1].toFixed(2) < 0;
};
