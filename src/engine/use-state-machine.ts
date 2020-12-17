import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasContext, useFrame } from "react-three-fiber";

export interface StateBehavior {
  onBeforeEnter?: (api: StateMachineApi) => void;
  onEnter?: (api: StateMachineApi) => void;
  update?: (
    api: StateMachineApi,
    delta: number,
    context: CanvasContext,
  ) => void;
  onExit?: (api: StateMachineApi) => void;
}

interface StateConfig {
  behaviors: StateBehavior[];
  update?: (
    api: StateMachineApi,
    delta: number,
    context: CanvasContext,
  ) => void;
}

interface StateMachineConfig<TContext = any> {
  initialState: string;
  states: Record<string, StateConfig>;
  context: TContext;
}

export interface StateMachineApi<TContext = any> {
  context: TContext;
  transition: (nextState: string) => void;
}

export function useStateMachine<TContext = any>(
  config: StateMachineConfig<TContext>,
): [string, StateMachineApi<TContext>] {
  const [states] = useState(() => config.states);
  const [currentState, setCurrentState] = useState(() => config.initialState);
  const [context] = useState(() => config.context);

  const isTransitioning = useRef(false);

  const api = useMemo<StateMachineApi>(
    () => ({
      context,
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
    [context, currentState, states],
  );

  useEffect(() => {
    console.log("initial");
    const { behaviors } = states[config.initialState];
    behaviors.forEach((behavior) => {
      behavior.onBeforeEnter?.(api);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      behavior.update?.(api, delta, context);
    }

    state.update?.(api, delta, context);
  });

  return [currentState, api];
}
