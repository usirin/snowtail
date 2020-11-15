import React, { useLayoutEffect } from "react";
import {
  GameObjectComponentProps,
  useGameObjectComponentManager,
} from "./use-game-object-component-manager";

export const GameObjectComponent: React.FC<GameObjectComponentProps> = ({
  name,
  api,
  children,
}) => {
  const {
    registerComponent,
    unregisterComponent,
  } = useGameObjectComponentManager();

  useLayoutEffect(() => {
    registerComponent(name, api);
  }, [api, name, registerComponent]);

  useLayoutEffect(() => {
    return () => unregisterComponent(name);
  }, [name, unregisterComponent]);

  return <>{children}</>;
};
