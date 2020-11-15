import { Vector3 } from "three";
import { assign, Machine, StateNodeConfig } from "xstate";

export interface MovingStateContext {
  velocity: Vector3;
}

export interface MovingStateShape {
  states: {
    on: {};
    off: {};
  };
}

export interface MoveStartEvent {
  type: "MOVE";
  velocity: Vector3;
}

export interface MoveStopEvent {
  type: "STOP";
}

export type MoveEvent = MoveStartEvent | MoveStopEvent;

export const createMovingStateConfig = (
  velocity: Vector3 = new Vector3(0, 0, 0),
): StateNodeConfig<MovingStateContext, MovingStateShape, MoveEvent> => {
  const original = velocity.clone();

  return {
    id: "moving",
    initial: "off",
    context: {
      velocity,
    },
    states: {
      off: {},
      on: {
        on: {
          STOP: {
            target: "off",
            actions: assign({ velocity: original }),
          },
        },
      },
    },
    on: {
      MOVE: {
        target: "on",
        actions: assign((context, event: MoveStartEvent) => ({
          velocity: context.velocity.clone().add(event.velocity),
        })),
      },
    },
  };
};

export const createMovingMachine = (
  velocity: Vector3 = new Vector3(0, 0, 0),
) => {
  return Machine<MovingStateContext, MovingStateShape, MoveEvent>(
    createMovingStateConfig(velocity),
  );
};
