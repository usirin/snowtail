import { Machine, MachineConfig } from "xstate";

export interface JumpingStateContext {
  duration: number;
}

export interface JumpingStateShape {
  states: {
    on: {};
    off: {};
  };
}

export type JumpEvent = { type: "JUMP" };

export const DEFAULT_JUMP_DURATION = 1000;

export const createJumpingStateConfig = (
  duration: number = DEFAULT_JUMP_DURATION,
): MachineConfig<JumpingStateContext, JumpingStateShape, JumpEvent> => {
  return {
    id: "jumping",
    initial: "off",
    context: {
      duration,
    },
    states: {
      off: {
        on: {
          JUMP: "on",
        },
      },
      on: {
        after: {
          [duration]: "off",
        },
      },
    },
  };
};

export const createJumpingMachine = (
  duration: number = DEFAULT_JUMP_DURATION,
) => {
  return Machine<JumpingStateContext, JumpingStateShape, JumpEvent>(
    createJumpingStateConfig(duration),
  );
};
