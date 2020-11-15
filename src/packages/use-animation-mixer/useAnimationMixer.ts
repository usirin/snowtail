import { useLazyRef } from "pkg/use-lazy-ref";
import { useEffect, useState } from "react";
import { useFrame } from "react-three-fiber";
import { AnimationAction, AnimationClip, AnimationMixer } from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

interface StateConfig {
  onEnter?: () => void;
  onExit?: () => void;
  tick?: () => void;
  action: AnimationAction;
}

interface StateMachineConfig<TActionName extends string> {
  initial: TActionName;
  states: Record<TActionName, StateConfig>;
}

export function useAnimationMixer<TActionName extends string>(
  model: GLTF,
  stateConfigFactory: (
    mixer: AnimationMixer,
    clips: AnimationClip[],
  ) => StateMachineConfig<TActionName>,
) {
  const [mixer] = useState(() => new AnimationMixer(model.scene));
  const config = useLazyRef<StateMachineConfig<TActionName>>(() =>
    stateConfigFactory(mixer, model.animations),
  );

  useFrame((state, delta) => mixer.update(delta));
  useEffect(() => {
    return () => model.animations.forEach((clip) => mixer.uncacheClip(clip));
  }, [mixer, model.animations]);

  return {
    mixer,
    actions: Object.fromEntries(
      Object.entries(config.current.states).map(([key, stateConfig]) => {
        return [key, (stateConfig as StateConfig).action];
      }),
    ),
  };
}
