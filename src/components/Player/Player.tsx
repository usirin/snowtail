import { useBox } from "@react-three/cannon";
import React, { MutableRefObject, useRef } from "react";
import { CanvasContext } from "react-three-fiber";
import { Kimana } from "snowtail/components/Kimana/Kimana";
import { PlayerApi } from "snowtail/components/Player/models";
import { JumpDown } from "snowtail/components/Player/states/JumpDown";
import { JumpUp } from "snowtail/components/Player/states/JumpUp";
import { GameObject } from "snowtail/engine/GameObject";
import { useGame } from "snowtail/engine/use-game";
import { InputManager } from "snowtail/engine/use-input-manager";
import {
  StateBehavior,
  StateMachineApi,
  useStateMachine,
} from "snowtail/engine/use-state-machine";
import { useWorkerVector } from "snowtail/engine/use-worker-vector";
import { AnimationMixer, Object3D } from "three";

const usePlayerPhysics = ({
  scale = [1, 3, 1],
  position = [0, 5, 0],
  rotation = [0, Math.PI / 2, 0],
} = {}): [MutableRefObject<Object3D | undefined>, PlayerApi] => {
  const [ref, api] = useBox(() => ({
    args: scale,
    mass: 50,
    position,
    rotation,
    fixedRotation: true,
    type: "Dynamic",
  }));

  const pos = useWorkerVector(api.position);
  const rot = useWorkerVector(api.rotation);
  const vel = useWorkerVector(api.velocity);

  const player = {
    position: pos,
    rotation: rot,
    velocity: vel,
  };

  return [ref, player];
};

interface PlayerAnimationState {
  moving: boolean;
  jumping: boolean;
}

interface MoveOptions {
  player: PlayerApi;
  speed: number;
  inputManager: InputManager;
}

class Move implements StateBehavior {
  private readonly player: PlayerApi;
  private readonly speed: number;
  private readonly inputManager: InputManager;

  constructor({ player, speed, inputManager }: MoveOptions) {
    this.player = player;
    this.speed = speed;
    this.inputManager = inputManager;
  }

  update(api: StateMachineApi<PlayerAnimationState>, delta: number): void {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");
    const player = this.player;

    if (moveLeftKey.pressed && moveRightKey.pressed) {
      api.context.moving = false;
      // api.transition("Idle");
    } else if (!moveLeftKey.pressed && !moveRightKey.pressed) {
      api.context.moving = false;
      // api.transition("Idle");
    } else if (moveLeftKey.pressed) {
      const position = player.position.get();
      const newX = position[0] - delta * this.speed;
      player.position.set(newX, position[1], position[2]);
      player.rotation.set(0, -Math.PI / 2, 0);
    } else if (moveRightKey.pressed) {
      const position = player.position.get();
      const newX = position[0] + delta * this.speed;
      player.position.set(newX, position[1], position[2]);
      player.rotation.set(0, Math.PI / 2, 0);
    }
  }
}

class CancelMove implements StateBehavior {
  private readonly inputManager: InputManager;
  constructor({ inputManager }: { inputManager: InputManager }) {
    this.inputManager = inputManager;
  }

  update(api: StateMachineApi, delta: number, context: CanvasContext): void {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");
    if (moveLeftKey.pressed && moveRightKey.pressed) {
      api.transition("Idle");
    } else if (!moveLeftKey.pressed && !moveRightKey.pressed) {
      api.transition("Idle");
    }
  }
}

interface IdleOptions {
  inputManager: InputManager;
}

class Idle implements StateBehavior {
  private readonly inputManager: InputManager;
  constructor({ inputManager }: IdleOptions) {
    this.inputManager = inputManager;
  }

  update(api: StateMachineApi, delta: number, context: CanvasContext): void {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");

    if (moveLeftKey.pressed && moveRightKey.pressed) {
      api.context.moving = false;
    } else if (moveLeftKey.pressed || moveRightKey.pressed) {
      api.context.moving = true;
    }
  }
}

class TriggerJump implements StateBehavior {
  private readonly inputManager: InputManager;

  constructor({ inputManager }: { inputManager: InputManager }) {
    this.inputManager = inputManager;
  }

  update(api: StateMachineApi, delta: number, context: CanvasContext): void {
    const jumpKey = this.inputManager.getKey("Jump");
    if (jumpKey.pressed) {
      api.context.jumping = true;
    }
  }
}

export const Player: React.FC = () => {
  const {
    managers: { input },
  } = useGame();

  const [ref, player] = usePlayerPhysics();
  const mixerRef = useRef<AnimationMixer | undefined>();

  const [state] = useStateMachine<PlayerAnimationState>({
    initialState: "JumpDown",
    context: {
      moving: false,
      jumping: false,
    },
    states: {
      Idle: {
        update: (api) => {
          if (api.context.moving) {
            api.transition("Walk");
          } else if (api.context.jumping) {
            api.transition("JumpUp");
          }
        },
        behaviors: [
          new Idle({ inputManager: input }),
          new TriggerJump({ inputManager: input }),
        ],
      },
      Walk: {
        behaviors: [
          new Move({ inputManager: input, player, speed: 5 }),
          new TriggerJump({ inputManager: input }),
          new CancelMove({ inputManager: input }),
        ],
      },
      JumpUp: {
        behaviors: [
          new JumpUp(mixerRef),
          new Move({ player, inputManager: input, speed: 3 }),
        ],
      },
      JumpDown: {
        behaviors: [
          new JumpDown(mixerRef),
          new Move({ player, inputManager: input, speed: 3 }),
        ],
      },
    },
  });

  console.log({ state });

  return (
    <GameObject ref={ref}>
      <Kimana
        onAnimationMixerCreated={(mixer) => (mixerRef.current = mixer)}
        action={state as "Idle" | "Walk" | "JumpUp" | "JumpDown"}
      />
    </GameObject>
  );
};