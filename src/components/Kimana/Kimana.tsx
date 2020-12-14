import { usePrevious } from "pkg/use-previous";
import { AnimationMixer, AnimationUtils, LoopOnce, Object3D } from "three";
import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "react-three-fiber";
import { useGLTF } from "@react-three/drei/useGLTF";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { animated as a, useSpring } from "react-spring/three";

import model from "./Kimana.glb";

type GLTFResult = GLTF & {
  nodes: {
    Cube004_0: THREE.SkinnedMesh;
    ["Cube.004_1_1"]: THREE.SkinnedMesh;
    ["Cube.004_2_1"]: THREE.SkinnedMesh;
    ["Cube.004_3_1"]: THREE.SkinnedMesh;
    ["Cube.004_4_1"]: THREE.SkinnedMesh;
    Bone: THREE.Bone;
  };
  materials: {
    Clothes: THREE.MeshStandardMaterial;
    Skin: THREE.MeshStandardMaterial;
    Band: THREE.MeshStandardMaterial;
    Face: THREE.MeshStandardMaterial;
    Hair: THREE.MeshStandardMaterial;
  };
};

export type AnimationAction =
  | "Idle"
  | "Jump"
  | "ReceiveHit"
  | "Run"
  | "Walk"
  | "JumpUp"
  | "JumpDown";
type GLTFActions = Record<AnimationAction, THREE.AnimationAction>;

const animationColors = {
  Idle: "rebeccapurple",
  Run: "hotpink",
  Walk: "hotpink",
  Jump: "red",
  JumpUp: "red",
  JumpDown: "yellow",
};

export type Props = JSX.IntrinsicElements["group"] & {
  action?: AnimationAction;
  onAnimationMixerCreated?: (mixer: AnimationMixer) => void;
};

interface UseAnimationMixerProps<T extends Object3D = Object3D> {
  root: T;
}

function useAnimationMixer<T extends Object3D>({
  root,
}: UseAnimationMixerProps<T>) {
  const [mixer] = useState(() => new THREE.AnimationMixer(root));
  useFrame((state, delta) => mixer.update(delta));

  return {
    mixer,
  };
}

export const Kimana: React.FC<Props> = ({
  action,
  onAnimationMixerCreated,
  ...props
}) => {
  const group = useRef<THREE.Group>();
  const { nodes, materials, animations } = useGLTF(model) as GLTFResult;

  const { mixer } = useAnimationMixer({ root: nodes["Cube004_0"] });

  useEffect(() => {
    onAnimationMixerCreated?.(mixer);
  }, [mixer, onAnimationMixerCreated]);

  const actions = useRef<GLTFActions>();
  useEffect(() => {
    const JumpUp = AnimationUtils.subclip(animations[1], "JumpUp", 0, 11);
    const JumpDown = AnimationUtils.subclip(animations[1], "JumpDown", 11, 26);

    actions.current = {
      Idle: mixer.clipAction(animations[0], group.current),
      Jump: mixer.clipAction(animations[1], group.current),
      ReceiveHit: mixer.clipAction(animations[2], group.current),
      Run: mixer.clipAction(animations[3], group.current),
      Walk: mixer.clipAction(animations[4], group.current),
      JumpUp: mixer.clipAction(JumpUp, group.current),
      JumpDown: mixer.clipAction(JumpDown, group.current),
    };

    actions.current.Jump.setLoop(LoopOnce, 1);
    actions.current.JumpUp.setLoop(LoopOnce, 1);
    actions.current.JumpDown.setLoop(LoopOnce, 1);

    actions.current.JumpUp.clampWhenFinished = true;
    actions.current.JumpDown.clampWhenFinished = true;

    return () => animations.forEach((clip) => mixer.uncacheClip(clip));
  }, [animations, mixer]);

  const prevAction = usePrevious(action);
  useEffect(() => {
    if (action) {
      const newAction = actions.current![action];
      newAction.reset();
      if (prevAction) {
        const oldAction = actions.current![prevAction];
        oldAction.stop();
      }
      newAction.enabled = true;
      newAction.play();
    }
  }, [actions, prevAction, action]);

  const { color } = useSpring({
    color: action ? animationColors[action] : "green",
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group position={[0, -1.5, 0]}>
        <primitive object={nodes.Bone} />
        <skinnedMesh
          material={materials.Clothes}
          geometry={nodes.Cube004_0.geometry}
          skeleton={nodes.Cube004_0.skeleton}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="white" skinning />
        </skinnedMesh>
        <skinnedMesh
          geometry={nodes["Cube.004_1_1"].geometry}
          skeleton={nodes["Cube.004_1_1"].skeleton}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial name="skin color" color="#001f3f" skinning />
        </skinnedMesh>
        <skinnedMesh
          material={materials.Band}
          geometry={nodes["Cube.004_2_2"].geometry}
          skeleton={nodes["Cube.004_2_2"].skeleton}
          receiveShadow
          castShadow
        >
          <meshStandardMaterial color="#ff2222" skinning />
        </skinnedMesh>
        <skinnedMesh
          material={materials.Face}
          geometry={nodes["Cube.004_3_3"].geometry}
          skeleton={nodes["Cube.004_3_3"].skeleton}
          receiveShadow
        >
          <meshStandardMaterial color="white" skinning />
        </skinnedMesh>
        <skinnedMesh
          geometry={nodes["Cube.004_4_4"].geometry}
          skeleton={nodes["Cube.004_4_4"].skeleton}
          receiveShadow
          castShadow
        >
          <a.meshStandardMaterial color={color} skinning />
        </skinnedMesh>
      </group>
    </group>
  );
};

useGLTF.preload(model);
