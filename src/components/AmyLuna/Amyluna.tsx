import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "react-three-fiber";
import { useGLTF } from "@react-three/drei/useGLTF";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import AmyLunaModel from "./amyluna.gltf";

type GLTFResult = GLTF & {
  nodes: {
    Ch46: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    Ch46_body: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | "T-Pose (No Animation)"
  | "HappyIdle"
  | "HappyWalk"
  | "Idle"
  | "Leftturn"
  | "Jump"
  | "Rightturn"
  | "RunForward"
  | "LeftStrafeWalk"
  | "LeftStrafe"
  | "RightStrafe"
  | "RightStrafeWalk";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export default function Amyluna(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>();
  const { nodes, materials, animations } = useGLTF(AmyLunaModel) as GLTFResult;

  const actions = useRef<GLTFActions>();
  const [mixer] = useState(() => new THREE.AnimationMixer(nodes.Ch46));
  useFrame((state, delta) => mixer.update(delta));
  useEffect(() => {
    actions.current = {
      "T-Pose (No Animation)": mixer.clipAction(animations[0], group.current),
      HappyIdle: mixer.clipAction(animations[1], group.current),
      HappyWalk: mixer.clipAction(animations[2], group.current),
      Idle: mixer.clipAction(animations[3], group.current),
      Leftturn: mixer.clipAction(animations[4], group.current),
      Jump: mixer.clipAction(animations[5], group.current),
      Rightturn: mixer.clipAction(animations[6], group.current),
      RunForward: mixer.clipAction(animations[7], group.current),
      LeftStrafeWalk: mixer.clipAction(animations[8], group.current),
      LeftStrafe: mixer.clipAction(animations[9], group.current),
      RightStrafe: mixer.clipAction(animations[10], group.current),
      RightStrafeWalk: mixer.clipAction(animations[11], group.current),
    };
    return () => animations.forEach((clip) => mixer.uncacheClip(clip));
  }, []);

  return (
    <group ref={group} {...props}>
      <group position={[0, -73.66, 2.17]}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          material={materials.Ch46_body}
          geometry={nodes.Ch46.geometry}
          skeleton={nodes.Ch46.skeleton}
        />
      </group>
    </group>
  );
}

useGLTF.preload(AmyLunaModel);
