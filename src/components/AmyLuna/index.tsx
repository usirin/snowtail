import { useBox } from "@react-three/cannon";
import { TransformControls, useGLTF } from "@react-three/drei";
import { useAnimationMixer } from "pkg/use-animation-mixer";
import React, { useEffect } from "react";
import { Matrix4, Mesh, Object3D, Vector3 } from "three";
import AmyLunaModel from "./amyluna.gltf";

type AnimationState = "HappyIdle" | "HappyWalk" | "RunForward";

interface Props {
  animationState?: AnimationState;
}

const AnimationStates: AnimationState[] = [
  "HappyIdle",
  "HappyWalk",
  "RunForward",
];

const isMesh = (node: Object3D): node is Mesh => {
  return !!(node as Mesh).geometry;
};

export const AmyLuna: React.FC<Props> = ({ animationState = "HappyIdle" }) => {
  const amyLuna = useGLTF(AmyLunaModel);
  const { actions, mixer } = useAnimationMixer(amyLuna, AnimationStates);

  console.log(amyLuna);

  useEffect(() => {
    amyLuna.scene.traverse((child) => {
      if (isMesh(child)) {
        console.log(child);
        child.castShadow = true;
        child.frustumCulled = false;
        child.geometry.computeVertexNormals();
        // child.geometry.translate(10, 10, 10);
      }
    });
  }, [amyLuna]);

  const [objectRef] = useBox(() => ({
    mass: 1,
    position: [1, 10, 1],
    // args: [1, 10, 1],
  }));

  useEffect(() => {
    mixer.stopAllAction();
    actions[animationState].play();
  }, [actions, animationState, mixer]);

  return (
    <TransformControls>
      <group ref={objectRef}>
        <primitive
          object={amyLuna.scene}
          dispose={null}
          scale={[0.1, 0.1, 0.1]}
        />
      </group>
    </TransformControls>
  );
};
