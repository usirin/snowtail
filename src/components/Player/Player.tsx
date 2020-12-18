import { useBox } from "@react-three/cannon";
import React, { MutableRefObject, useRef } from "react";
import { useFrame } from "react-three-fiber";
import {
  Kimana,
  AnimationAction as KimanaAnimationAction,
} from "snowtail/components/Kimana/Kimana";
import { PlayerApi } from "snowtail/components/Player/models";
import { JumpDown } from "snowtail/components/Player/states/JumpDown";
import { JumpPrep } from "snowtail/components/Player/states/JumpPrep";
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
import { useTweaks } from "use-tweaks";

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

  const player: PlayerApi = {
    position: pos,
    rotation: rot,
    velocity: vel,
    applyForce: (force, point) => api.applyForce(force, point),
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
      api.context.moving = true;
      const position = player.position.get();
      const newX = position[0] - delta * this.speed;
      player.position.set(newX, position[1], position[2]);
      player.rotation.set(0, -Math.PI / 2, 0);
    } else if (moveRightKey.pressed) {
      api.context.moving = true;
      const position = player.position.get();
      const newX = position[0] + delta * this.speed;
      player.position.set(newX, position[1], position[2]);
      player.rotation.set(0, Math.PI / 2, 0);
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

  update(api: StateMachineApi): void {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");

    if (moveLeftKey.pressed && moveRightKey.pressed) {
      api.context.moving = false;
    } else if (!moveLeftKey.pressed && !moveRightKey.pressed) {
      api.context.moving = false;
    } else {
      api.context.moving = true;
    }
  }
}

class TriggerJump implements StateBehavior {
  private readonly inputManager: InputManager;

  constructor({ inputManager }: { inputManager: InputManager }) {
    this.inputManager = inputManager;
  }

  update(api: StateMachineApi): void {
    api.context.jumping = this.inputManager.getKey("Jump").pressed;
  }
}

export const Player: React.FC = () => {
  const {
    managers: { input },
  } = useGame();

  const [ref, player] = usePlayerPhysics();
  const mixerRef = useRef<AnimationMixer | undefined>();

  const tweaks = useTweaks({
    regularMoveSpeed: 5,
    jumpForce: 8,
    jumpMoveSpeed: 6,
  });

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
            api.transition("JumpPrep");
          }
        },
        behaviors: [
          new Idle({ inputManager: input }),
          new TriggerJump({ inputManager: input }),
        ],
      },
      Walk: {
        update: (api) => {
          if (api.context.jumping) {
            api.transition("JumpPrep");
          } else if (!api.context.moving) {
            api.transition("Idle");
          }
        },
        behaviors: [
          new Move({
            inputManager: input,
            player,
            speed: tweaks.regularMoveSpeed,
          }),
          new TriggerJump({ inputManager: input }),
        ],
      },
      JumpPrep: {
        behaviors: [
          new JumpPrep(mixerRef),
          new Move({
            player,
            inputManager: input,
            speed: tweaks.jumpMoveSpeed,
          }),
        ],
      },
      JumpUp: {
        behaviors: [
          new JumpUp({ mixer: mixerRef, player, jumpForce: tweaks.jumpForce }),
          new Move({
            player,
            inputManager: input,
            speed: tweaks.jumpMoveSpeed,
          }),
        ],
      },
      JumpDown: {
        behaviors: [
          new JumpDown({ mixer: mixerRef, player }),
          new Move({
            player,
            inputManager: input,
            speed: tweaks.jumpMoveSpeed,
          }),
        ],
      },
    },
  });

  useFrame((context, delta) => {
    context.camera.position.x = player.position.get()[0];
  });

  console.log({ state });

  return (
    <GameObject ref={ref}>
      {/*<mesh enabled>*/}
      {/*  <boxBufferGeometry args={[1, 3, 1]} />*/}
      {/*  <meshPhongMaterial wireframe color="rebeccapurple" attach="material" />*/}
      {/*</mesh>*/}
      <Kimana
        onAnimationMixerCreated={(mixer) => (mixerRef.current = mixer)}
        action={state as KimanaAnimationAction}
      />
    </GameObject>
  );
};
