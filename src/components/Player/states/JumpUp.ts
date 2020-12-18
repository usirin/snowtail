import { MutableRefObject } from "react";
import { PlayerApi } from "snowtail/components/Player/models";
import {
  StateBehavior,
  StateMachineApi,
} from "snowtail/engine/use-state-machine";
import { AnimationMixer } from "three";

interface JumpUpOptions {
  mixer: MutableRefObject<AnimationMixer | undefined>;
  player: PlayerApi;
  jumpForce: number;
}

export class JumpUp implements StateBehavior {
  private mixer: MutableRefObject<AnimationMixer | undefined>;
  private api: StateMachineApi | undefined;
  private player: PlayerApi;
  private jumpForce: number;

  constructor({ mixer, player, jumpForce }: JumpUpOptions) {
    this.mixer = mixer;
    this.player = player;
    this.jumpForce = jumpForce;
  }

  onAnimationFinished = () => {
    this.api?.transition("JumpDown");
  };

  onEnter(api: StateMachineApi) {
    this.api = api;
    this.mixer.current?.addEventListener("finished", this.onAnimationFinished);

    // this.player.applyForce([0, 0, 10], [0, 0, 0]);

    const velocity = this.player.velocity.get();
    console.log("JumpUp velocity", velocity);
    this.player.velocity.set(velocity[0], this.jumpForce, velocity[2]);
  }

  update() {
    console.log(this.player.position.get(), this.player.velocity.get());
  }

  onExit() {
    this.mixer.current?.removeEventListener(
      "finished",
      this.onAnimationFinished,
    );
  }
}
