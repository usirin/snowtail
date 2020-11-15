import { useMemo } from "react";
import { AnimationAsset } from "pkg/use-animation-mixer/AnimationAsset";
import * as THREE from "three";

export const useCreateAnimationMixer = (
  model: AnimationAsset,
  clips?: THREE.AnimationClip[],
): [THREE.AnimationMixer, THREE.AnimationAction[]] => {
  const mixer = useMemo(() => {
    return new THREE.AnimationMixer(model);
  }, [model]);

  const animations = useMemo(() => {
    return (clips || []).map((clip) => {
      const animation = mixer.clipAction(clip);
      animation.clampWhenFinished = true;
      animation.enabled = true;
      return animation;
    });
  }, [clips, mixer]);

  return [mixer, animations];
};
