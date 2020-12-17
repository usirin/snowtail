import { MutableRefObject } from "react";
import {
  StateBehavior,
  StateMachineApi,
} from "snowtail/engine/use-state-machine";
import { AnimationMixer } from "three";

export class JumpUp implements StateBehavior {
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
