import { createPubSub } from "pkg/pubsub";
import React, { useEffect, useState } from "react";
import { useInputManager } from "snowtail/engine/use-input-manager";
import { GameContext, GameContextValue } from "./use-game";

interface GameProps {}

export const Game: React.FC<GameProps> = ({ children }) => {
  const [paused, setPaused] = useState(false);
  const [pubsub] = useState(() => createPubSub());
  const inputManager = useInputManager();

  useEffect(() => {
    inputManager.addKeyMap("a", "MoveLeft");
    inputManager.addKeyMap("d", "MoveRight");
    inputManager.addKeyMap(" ", "Jump");
  }, [inputManager]);

  const context: GameContextValue = {
    paused,
    setPaused,
    ...pubsub,

    managers: {
      input: inputManager,
    },
  };

  return (
    <GameContext.Provider value={context}>{children}</GameContext.Provider>
  );
};
