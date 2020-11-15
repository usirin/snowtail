import { PubSub } from "pkg/pubsub";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export type GameContextValue = PubSub & {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
};

export const GameContext = createContext<GameContextValue>({
  hasSubscriptions: () => 0,
  paused: false,
  setPaused: () => {},
  publish: () => Promise.resolve(false),
  subscribe: () => () => {},
});

export const useGame = () => useContext(GameContext);
