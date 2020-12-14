import { useBox, WorkerApi } from "@react-three/cannon";
import React, { MutableRefObject, useCallback, useEffect, useRef } from "react";
import { Kimana } from "snowtail/components/Kimana/Kimana";
import { GameObject } from "snowtail/engine/GameObject";
import { useGame } from "snowtail/engine/use-game";
import { InputManager } from "snowtail/engine/use-input-manager";
import {
  StateBehavior,
  StateMachineApi,
  useStateMachine,
} from "snowtail/engine/use-state-machine";
import { AnimationMixer, Object3D, Event } from "three";

type WorkerVec = WorkerApi["position"];
type VectorRef = WorkerVec & {
  get: () => number[];
};

const useVectorRef = (vec: WorkerVec, initialValue: number[] = [0, 0, 0]) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    vec.subscribe((val) => (ref.current = val));
  }, [vec]);

  const vectorRef: VectorRef = {
    ...vec,
    get: () => ref.current,
  };

  return vectorRef;
};

interface PlayerApi {
  position: VectorRef;
  rotation: VectorRef;
  velocity: VectorRef;
}

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

  const pos = useVectorRef(api.position);
  const rot = useVectorRef(api.rotation);
  const vel = useVectorRef(api.velocity);

  const player = {
    position: pos,
    rotation: rot,
    velocity: vel,
  };

  return [ref, player];
};

const isGoingUp = (player: PlayerApi) => {
  const velocity = player.velocity.get();
  return +velocity[1].toFixed(2) > 0;
};

const isGoingDown = (player: PlayerApi) => {
  const velocity = player.velocity.get();
  return +velocity[1].toFixed(2) < 0;
};

class JumpDown implements StateBehavior {
  private mixer: MutableRefObject<AnimationMixer | undefined>;
  private api: StateMachineApi | undefined;
  constructor(mixer: MutableRefObject<AnimationMixer | undefined>) {
    this.mixer = mixer;
  }

  onAnimationFinished = () => {
    this.api?.transition("Idle");
  };

  onBeforeEnter(api: StateMachineApi) {
    this.api = api;
    this.mixer.current?.addEventListener("finished", this.onAnimationFinished);
  }

  onExit() {
    this.mixer.current?.removeEventListener(
      "finished",
      this.onAnimationFinished,
    );
  }
}

class JumpUp implements StateBehavior {
  private mixer: MutableRefObject<AnimationMixer | undefined>;
  private api: StateMachineApi | undefined;
  constructor(mixer: MutableRefObject<AnimationMixer | undefined>) {
    this.mixer = mixer;
  }

  onAnimationFinished = () => {
    this.api?.transition("JumpDown");
  };

  onBeforeEnter(api: StateMachineApi) {
    this.api = api;
    this.mixer.current?.addEventListener("finished", this.onAnimationFinished);
  }

  onExit() {
    this.mixer.current?.removeEventListener(
      "finished",
      this.onAnimationFinished,
    );
  }
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

  update(_: unknown, delta: number, api: StateMachineApi) {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");
    const player = this.player;
    if (moveLeftKey.pressed && moveRightKey.pressed) {
      api.transition("Idle");
    } else if (!moveLeftKey.pressed && !moveRightKey.pressed) {
      api.transition("Idle");
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

  update(_: unknown, delta: number, api: StateMachineApi) {
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

  update(_: unknown, delta: number, api: StateMachineApi) {
    const moveLeftKey = this.inputManager.getKey("MoveLeft");
    const moveRightKey = this.inputManager.getKey("MoveRight");

    if (moveLeftKey.pressed && moveRightKey.pressed) {
      return;
    } else if (moveLeftKey.pressed || moveRightKey.pressed) {
      api.transition("Walk");
    }
  }
}

class TriggerJump implements StateBehavior {
  private readonly inputManager: InputManager;

  constructor({ inputManager }: { inputManager: InputManager }) {
    this.inputManager = inputManager;
  }

  update(_: unknown, delta: number, api: StateMachineApi) {
    const jumpKey = this.inputManager.getKey("Jump");
    if (jumpKey.pressed) {
      api.transition("JumpUp");
    }
  }
}

export const Player: React.FC = () => {
  const {
    managers: { input },
  } = useGame();

  const [ref, player] = usePlayerPhysics();
  const mixerRef = useRef<AnimationMixer | undefined>();

  const [state] = useStateMachine({
    initialState: "JumpDown",
    states: {
      Idle: {
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
