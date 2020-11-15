import { useAnimationMixer } from "pkg/use-animation-mixer";
import { usePrevious } from "pkg/use-previous";
import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei/useGLTF";
import { useFrame } from "react-three-fiber";
import { AnimationClip, AnimationMixer, Group, Vector3 } from "three";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import AmyLunaModel from "./amyluna_scaleddown.glb";

type GLTFResult = GLTF & {
  nodes: {
    Ch46: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    ["Ch46_body.001"]: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | "Idle"
  | "Walk"
  | "Jump"
  | "LeftStrafe"
  | "LeftStrafeWalk"
  | "TurnLeft"
  | "StrafeRight"
  | "RightStrafeWalk"
  | "TurnRight"
  | "RunForward";

type Props = Partial<JSX.IntrinsicElements["group"]> & {
  action?: ActionName;
  velocity: Vector3;
  actionDuration?: number;
};

const createStateConfig = (
  mixer: AnimationMixer,
  clips: AnimationClip[],
  group: Group,
) => ({
  initial: "Idle" as "Idle",
  states: {
    Idle: { action: mixer.clipAction(clips[0], group) },
    Walk: { action: mixer.clipAction(clips[1], group) },
    Jump: { action: mixer.clipAction(clips[3], group) },
    LeftStrafe: { action: mixer.clipAction(clips[4], group) },
    LeftStrafeWalk: { action: mixer.clipAction(clips[5], group) },
    TurnLeft: { action: mixer.clipAction(clips[6], group) },
    StrafeRight: { action: mixer.clipAction(clips[7], group) },
    RightStrafeWalk: { action: mixer.clipAction(clips[8], group) },
    TurnRight: { action: mixer.clipAction(clips[9], group) },
    RunForward: { action: mixer.clipAction(clips[10], group) },
  },
});

export function AmyLunaScaledDown(props: Props) {
  const group = useRef<THREE.Group>();
  const model = useGLTF(AmyLunaModel) as GLTFResult;
  const { nodes, materials } = model;

  const { actions } = useAnimationMixer<ActionName>(model, (mixer, clips) =>
    createStateConfig(mixer, clips, group.current!),
  );

  useFrame((state, delta) => {
    group.current!.position.x += props.velocity.x * delta;
    group.current!.position.y += props.velocity.y * delta;
    group.current!.position.z += props.velocity.z * delta;
    // console.log(1, props.velocity);
    // console.log(2, group.current!.position);
  });

  const prevAction = usePrevious(props.action);
  console.log(prevAction);
  useEffect(() => {
    if (props.action) {
      const currentAction = actions[props.action];
      currentAction.enabled = true;
      if (prevAction) {
        const oldAction = actions[prevAction];
        oldAction.paused = true;
        currentAction.paused = false;
        if (props.actionDuration)
          currentAction.setDuration(props.actionDuration);
        currentAction.crossFadeFrom(oldAction, 0.15, true);
      }
      currentAction.play();
    }
  }, [actions, prevAction, props.action, props.actionDuration]);

  return (
    <group ref={group} {...props} scale={[0.01, 0.01, 0.01]}>
      <group>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          material={materials["Ch46_body.001"]}
          geometry={nodes.Ch46.geometry}
          skeleton={nodes.Ch46.skeleton}
        />
      </group>
    </group>
  );
}

useGLTF.preload(AmyLunaModel);
