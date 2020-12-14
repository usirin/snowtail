import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasContext, useFrame } from "react-three-fiber";

export interface StateBehavior {
  onBeforeEnter?: (api: StateMachineApi) => void;
  onEnter?: (api: StateMachineApi) => void;
  update?: (
    context: CanvasContext,
    delta: number,
    api: StateMachineApi,
  ) => void;
  onExit?: (api: StateMachineApi) => void;
}

interface StateConfig {
  behaviors: StateBehavior[];
}

interface StateMachineConfig {
  initialState: string;
  states: Record<string, StateConfig>;
}

export interface StateMachineApi {
  transition: (nextState: string) => void;
}

export function useStateMachine(
  config: StateMachineConfig,
): [string, StateMachineApi] {
  const [states] = useState(() => config.states);
  const [currentState, setCurrentState] = useState(() => config.initialState);

  const isTransitioning = useRef(false);

  const api = useMemo<StateMachineApi>(
    () => ({
      transition: (state: string) => {
        isTransitioning.current = true;
        console.log({ to: state, from: currentState });
        const oldState = states[currentState];
        console.log("old state", currentState, oldState);
        for (let behavior of oldState.behaviors) {
          behavior.onExit?.(api);
        }

        const newState = states[state];
        for (let behavior of newState.behaviors) {
          behavior.onBeforeEnter?.(api);
        }

        setCurrentState(state);
      },
    }),
    [currentState, states],
  );

  useEffect(() => {
    console.log("initial");
    const { behaviors } = states[config.initialState];
    behaviors.forEach((behavior) => {
      behavior.onBeforeEnter?.(api);
    });
  }, [config.initialState, states]);

  useEffect(() => {
    const newState = states[currentState];
    console.log("new state", currentState, newState);
    for (let behavior of newState.behaviors) {
      behavior.onBeforeEnter?.(api);
    }
    isTransitioning.current = false;
  }, [api, currentState, states]);

  useFrame((context, delta) => {
    // console.log("currentStaetl", currentState);
    if (isTransitioning.current) return;

    const state = states[currentState];
    for (let behavior of state.behaviors) {
      behavior.update?.(context, delta, api);
    }
  });

  return [currentState, api];
}
