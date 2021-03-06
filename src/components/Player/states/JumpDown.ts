import { MutableRefObject } from "react";
import { PlayerApi } from "snowtail/components/Player/models";
import {
  StateBehavior,
  StateMachineApi,
} from "snowtail/engine/use-state-machine";
import { AnimationMixer } from "three";

interface JumpDownOptions {
  mixer: MutableRefObject<AnimationMixer | undefined>;
  player: PlayerApi;
}

export class JumpDown implements StateBehavior {
  private mixer: MutableRefObject<AnimationMixer | undefined>;
  private api: StateMachineApi | undefined;
  private player: PlayerApi;

  constructor({ mixer, player }: JumpDownOptions) {
    this.mixer = mixer;
    this.player = player;
  }

  onAnimationFinished = () => {
    this.api?.transition("Idle");
  };

  onEnter(api: StateMachineApi) {
    this.api = api;
    this.mixer.current?.addEventListener("finished", this.onAnimationFinished);
  }

  update(api: StateMachineApi, delta: number) {
    const velocity = this.player.velocity.get();
    this.player.velocity.set(
      velocity[0],
      velocity[1] + -10 * 1.5 * delta,
      velocity[2],
    );
  }

  onExit() {
    this.mixer.current?.removeEventListener(
      "finished",
      this.onAnimationFinished,
    );
  }
}
