import { Vector3 } from "three";
import { assign, Machine } from "xstate";

export interface AnimationStateSchema {
  states: {
    idle: {};
    moving: {};
  };
}

export interface AnimationStateContext {
  velocity: Vector3;
}

type MoveEvent = { type: "MOVE"; velocity: Vector3 };

export type AnimationStateEvent = MoveEvent | { type: "STOP" };

const initialContext: AnimationStateContext = {
  velocity: new Vector3(0, 0, 0),
};

export const moveForward = (): MoveEvent => ({
  type: "MOVE",
  velocity: new Vector3(0, 0, 1),
});

const JUMP_DURATION = 1000;
const jumpingMachine = new Machine<>({
  id: "jumping",
  initial: "off",
  context: {
    duration: JUMP_DURATION,
  },
  states: {
    off: {
      on: {
        START_JUMPING: "on",
      },
    },
    on: {
      after: {
        [JUMP_DURATION]: "off",
      },
    },
  },
});

const movingMachine = {};

export const createAnimationStateMachine = () => {
  return Machine<
    AnimationStateContext,
    AnimationStateSchema,
    AnimationStateEvent
  >({
    id: "character-animation",
    initial: "idle",
    context: initialContext,
    states: {
      idle: {
        on: {
          MOVE: {
            target: "moving",
            actions: assign((_context, event) => ({
              velocity: event.velocity,
            })),
          },
        },
      },
      moving: {
        on: {
          STOP: {
            target: "idle",
            actions: assign(() => ({ velocity: new Vector3(0, 0, 0) })),
          },
        },
      },
    },
  });
};
