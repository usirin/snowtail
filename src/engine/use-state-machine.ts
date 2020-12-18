import { useEffect, useMemo, useState } from "react";
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
  const [context] = useState(() => ({ ...config.context }));

  const api = useMemo<StateMachineApi>(
    () => ({
      context,
      transition: (state: string) => {
        console.log({ to: state, from: currentState });
        const oldState = states[currentState];
        console.log("old state", currentState, oldState);
        for (let behavior of oldState.behaviors) {
          behavior.onExit?.(api);
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
      behavior.onEnter?.(api);
    }
  }, [api, currentState, states]);

  useFrame((context, delta) => {
    const state = states[currentState];
    for (let behavior of state.behaviors) {
      behavior.update?.(api, delta, context);
    }

    state.update?.(api, delta, context);
  });

  return [currentState, api];
}
