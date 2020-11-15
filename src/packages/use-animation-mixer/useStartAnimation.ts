import { useEffect } from "react";
import * as THREE from "three";

let ANIMATION_REQUEST_ID: number;

export function setAnimationTime(
  mixer: THREE.AnimationMixer,
  animation: THREE.AnimationAction,
  progress: number,
) {
  const duration = (animation as any)._clip.duration;
  const seekTime = duration * (progress / 100);

  // set the active animation and mixer time to 0 to reset,
  // then update the time using AnimationMixer#update
  animation.paused = false;
  animation.enabled = true;
  animation.time = 0;
  mixer.time = 0;
  mixer.update(seekTime);
}

function startAnimationLoop(
  mixer: THREE.AnimationMixer,
  animation: THREE.AnimationAction,
  setPlaying: Function,
  setProgress: Function,
) {
  let lastTime = 0;

  const tick = (timestamp: number) => {
    // if the animation is no longer playing, then cancel loop
    if (animation.paused) {
      setPlaying(false);
      setProgress(0);
      lastTime = 0;
      return;
    }

    const delta = lastTime ? timestamp - lastTime : 0;

    // advance the animation-mixer timer
    mixer.update(delta / 1000);

    // set the time for the next animation tick
    lastTime = timestamp;

    // calculate and set the progress
    const duration = (animation as any)._clip.duration;
    const elapsedDuration = mixer.time % duration;
    const progress = (elapsedDuration / duration) * 100;
    setProgress(progress);

    // request the next frame
    ANIMATION_REQUEST_ID = requestAnimationFrame(tick);
  };

  // kick off the animation loop
  ANIMATION_REQUEST_ID = requestAnimationFrame(tick);
}

export function stopAnimationLoop() {
  cancelAnimationFrame(ANIMATION_REQUEST_ID);
}

interface UseStartAnimationProps {
  mixer: THREE.AnimationMixer;
  progress: number;
  animation: THREE.AnimationAction;
  timeScale: number;
  loopMode: THREE.AnimationActionLoopStyles;
  playing: boolean;
  setProgress: (p: number) => void;
  setPlaying: (p: boolean) => void;
}

export function useStartAnimation({
  mixer,
  progress,
  animation,
  timeScale,
  loopMode,
  playing,
  setProgress,
  setPlaying,
}: UseStartAnimationProps) {
  useEffect(() => {
    if (!mixer || !animation || !playing) {
      return;
    }

    // stop any active animations
    stopAnimationLoop();
    mixer.stopAllAction();

    // set an initial seek time
    setAnimationTime(mixer, animation, progress);

    // configure the animation before starting the loop
    animation
      .setEffectiveTimeScale(timeScale)
      .setLoop(loopMode, Infinity)
      .fadeIn(0)
      .play();

    // kick off the loop
    startAnimationLoop(mixer, animation, setPlaying, setProgress);

    // cleanup step, when effect unmounts
    return () => {
      stopAnimationLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, playing, animation]);
}
