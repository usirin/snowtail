import { PubSub } from "pkg/pubsub";
import { createContext, Dispatch, SetStateAction, useContext } from "react";
import { InputManager } from "snowtail/engine/use-input-manager";

export type GameContextValue = PubSub & {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  managers: {
    input: InputManager;
  };
};

export const GameContext = createContext<GameContextValue>({
  hasSubscriptions: () => 0,
  paused: false,
  setPaused: () => {},
  publish: () => Promise.resolve(false),
  subscribe: () => () => {},

  managers: {
    input: {
      addKeyMap: () => {},
      getKey: () => ({ justPressed: false, pressed: false }),
    },
  },
});

export const useGame = () => useContext(GameContext);
