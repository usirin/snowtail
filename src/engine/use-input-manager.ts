import { useWindowEvent } from "pkg/use-window-event";
import { useCallback, useMemo } from "react";
import { useFrame } from "react-three-fiber";

interface InputKeyState {
  pressed: boolean;
  justPressed: boolean;
}

export interface InputManager {
  addKeyMap: (key: string, name: string) => void;
  getKey: (key: string) => InputKeyState;
}

const defaultState = { pressed: false, justPressed: false };

export const useInputManager = () => {
  const keys = useMemo<Record<string, InputKeyState>>(() => ({}), []);
  const keyMap = useMemo(() => new Map<string, string>(), []);

  const setKey = useCallback(
    (key: string, pressed: boolean) => {
      const name = keyMap.get(key);
      if (!name) {
        return;
      }
      const keyState = keys[name];
      keyState.justPressed = pressed && !keyState.pressed;
      keyState.pressed = pressed;
    },
    [keyMap, keys],
  );

  const api = useMemo<InputManager>(
    () => ({
      addKeyMap: (key: string, name: string) => {
        keys[name] = { ...defaultState };
        keyMap.set(key, name);
      },
      getKey: (name: string) => {
        return keys[name] || { ...defaultState };
      },
    }),
    [keyMap, keys],
  );

  useWindowEvent("keydown", (e) => {
    setKey(e.key, true);
  });

  useWindowEvent("keyup", (e) => {
    setKey(e.key, false);
  });

  useFrame(() => {
    const keyStates = Object.values(keys);
    for (const keyState of keyStates) {
      if (keyState.justPressed) {
        keyState.justPressed = false;
      }
    }
  });

  return api;
};
