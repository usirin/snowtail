import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Object3D } from "three";
import { useGame } from "./use-game";
import { useSceneManager } from "./use-scene-manager";
import { PubSubEvent } from "pkg/pubsub";

export type SceneInitEvent = PubSubEvent<"scene-init", string>;
export type SceneReadyEvent = PubSubEvent<"scene-ready", string>;
export type ScenePreExitEvent = PubSubEvent<"scene-pre-exit", string>;
export type SceneExitEvent = PubSubEvent<"scene-exit", string>;

interface SceneContextValue {
  currentScene: string;
  currentLevel: number;
  prevLevel: number;
  resetScene: () => void;
  setLevel: (level: number) => void;
}
const noop = () => {};
const asyncNoop = () => Promise.resolve();

const SceneContext = React.createContext<SceneContextValue>({
  currentLevel: 0,
  currentScene: "",
  prevLevel: 0,
  resetScene: asyncNoop,
  setLevel: asyncNoop,
});

export function useScene() {
  return useContext(SceneContext) as SceneContextValue;
}

export interface LevelContextValue {
  level: number;
  transition: -1 | 1;
  enterPrevLevel: () => void;
  enterNextLevel: () => void;
}

export const LevelContext = React.createContext<LevelContextValue>({
  level: 0,
  transition: -1,
  enterNextLevel: noop,
  enterPrevLevel: noop,
});

export function useLevel() {
  return useContext(LevelContext) as LevelContextValue;
}

interface Props {
  id: string;
  children: React.ReactNode;
}

// max ms delay between scene init and ready events
const sceneReadyTimeout = 1000;

export function Scene({ id, children }: Props) {
  const { publish } = useGame();
  const {
    currentScene,
    currentLevel,
    prevLevel,
    resetScene,
    setLevel,
  } = useSceneManager();
  const [instances, setInstances] = useState<React.ReactElement[]>([]);
  const idleCallback = useRef();

  const initEvents = useCallback(async () => {
    await publish<SceneInitEvent>("scene-init", id);
    // ensure everything is ready on next idle callback
    // @ts-ignore
    idleCallback.current = window.requestIdleCallback(
      () => {
        publish<SceneReadyEvent>("scene-ready", id);
      },
      { timeout: sceneReadyTimeout },
    );
  }, [publish, id]);

  const contextValue = useMemo<SceneContextValue>(
    () => ({
      // pass through from scene manager
      currentScene,
      currentLevel,
      prevLevel,
      resetScene,
      setLevel,
    }),
    [currentScene, currentLevel, prevLevel, resetScene, setLevel],
  );

  const levelContextValue = useMemo<LevelContextValue>(
    () => ({
      level: currentLevel,
      transition: prevLevel < currentLevel ? -1 : 1,
      enterPrevLevel: () => void setLevel(currentLevel - 1),
      enterNextLevel: () => void setLevel(currentLevel + 1),
    }),
    [currentLevel, prevLevel, setLevel],
  );

  useEffect(() => {
    if (currentScene === id) {
      // entering scene
      initEvents();
    } else {
      // leaving scene
      setInstances([]);
    }
    // @ts-ignore
    return () => window.cancelIdleCallback(idleCallback.current);
  }, [currentScene, id, initEvents]);

  // skip rendering scene content
  if (!currentScene.startsWith(id)) return null;

  return (
    <SceneContext.Provider value={contextValue}>
      <LevelContext.Provider value={levelContextValue}>
        <group>
          {/* just to ensure node.parent in a GO still remains within the scene */}
          <group>
            <>{children}</>
            <>{instances}</>
          </group>
        </group>
      </LevelContext.Provider>
    </SceneContext.Provider>
  );
}
