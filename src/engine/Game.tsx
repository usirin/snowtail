import { createPubSub } from "pkg/pubsub";
import React, { useState } from "react";
import { Canvas, CanvasProps } from "react-three-fiber";
import { GameContext, GameContextValue } from "./use-game";

interface GameProps {
  cameraProps: CanvasProps["camera"];
  hasFog?: boolean;
}

export const Game: React.FC<GameProps> = ({
  cameraProps,
  children,
  hasFog = true,
}) => {
  const [paused, setPaused] = useState(false);
  const [pubsub] = useState(() => createPubSub());

  const context: GameContextValue = {
    paused,
    setPaused,
    ...pubsub,
  };

  return (
    <Canvas
      shadowMap
      gl={{ alpha: true }}
      camera={{ position: cameraProps.position }}
    >
      {hasFog && <fog />}
      <GameContext.Provider value={context}>{children}</GameContext.Provider>
    </Canvas>
  );
};
