import { createContext, useContext } from "react";

export interface SceneManagerContextValue {
  currentScene: string;
  currentLevel: number;
  prevLevel: number;
  setScene: (sceneId: string) => Promise<void>;
  setLevel: (level: number) => Promise<void>;
  resetScene: () => Promise<void>;
  setSceneState: (key: string, value: any) => void;
  getSceneState: (key: string) => any;
}

const noop = () => {};
const asyncNoop = () => Promise.resolve();

export const SceneManagerContext = createContext<SceneManagerContextValue>({
  currentLevel: 0,
  currentScene: "",
  getSceneState: noop,
  prevLevel: 0,
  resetScene: asyncNoop,
  setLevel: asyncNoop,
  setScene: asyncNoop,
  setSceneState: noop,
});

export const useSceneManager = () => useContext(SceneManagerContext);
