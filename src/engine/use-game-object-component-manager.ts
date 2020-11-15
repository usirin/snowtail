import create, { UseStore } from "zustand";
import omit from "lodash-es/omit";

export interface GameObjectComponentProps {
  name: string;
  api: Readonly<unknown>;
}

type GameObjectComponentManager = {
  components: Record<string, GameObjectComponentProps>;
  registerComponent: (
    name: GameObjectComponentProps["name"],
    api: GameObjectComponentProps["api"],
  ) => void;
  unregisterComponent: (name: GameObjectComponentProps["name"]) => void;
  getComponent: <T extends GameObjectComponentProps>(
    name: T["name"],
  ) => T["api"];
};

const managers: Record<string, UseStore<GameObjectComponentManager>> = {};

export const useGameObjectComponentManager = (name: string) => {
  if (managers[name]) {
    return managers[name];
  }

  const manager = create<GameObjectComponentManager>((set, get) => ({
    name,
    components: {},
    registerComponent: (name, api) =>
      set((state) => ({
        [name]: { name, api },
      })),
    unregisterComponent: (name) => set((state) => omit(state, name)),
    getComponent: (name) => get().components[name],
  }));

  managers[name] = manager;
  return manager;
};
