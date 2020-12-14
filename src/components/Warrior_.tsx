import { useGLTF } from "@react-three/drei/useGLTF";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import model from "./Warrior.glb";

type GLTFResult = GLTF & {
  nodes: {
    Face: THREE.Mesh;
    ["Shoulder.L_1"]: THREE.Mesh;
    Warrior_Sword: THREE.Mesh;
    ["Shoulder.R_1"]: THREE.Mesh;
    Warrior002: THREE.SkinnedMesh;
    Root: THREE.Bone;
  };
  materials: {
    Warrior_Texture: THREE.MeshStandardMaterial;
    Warrior_Sword_Texture: THREE.MeshStandardMaterial;
  };
};

type ActionName =
  | "Death"
  | "Idle"
  | "Idle.001"
  | "Idle_Weapon"
  | "PickUp"
  | "Punch"
  | "RecieveHit"
  | "RecieveHit_Attacking"
  | "Run"
  | "Sword_Attack"
  | "Walk";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

export function Warrior(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>();
  const { nodes, materials, animations } = useGLTF(model) as GLTFResult;

  const actions = useRef<GLTFActions>();
  const [mixer] = useState(() => new THREE.AnimationMixer(nodes.Warrior002));
  useFrame((state, delta) => mixer.update(delta));
  useEffect(() => {
    actions.current = {
      Death: mixer.clipAction(animations[0], group.current),
      Idle: mixer.clipAction(animations[1], group.current),
      "Idle.001": mixer.clipAction(animations[2], group.current),
      Idle_Weapon: mixer.clipAction(animations[3], group.current),
      PickUp: mixer.clipAction(animations[4], group.current),
      Punch: mixer.clipAction(animations[5], group.current),
      RecieveHit: mixer.clipAction(animations[6], group.current),
      RecieveHit_Attacking: mixer.clipAction(animations[7], group.current),
      Run: mixer.clipAction(animations[8], group.current),
      Sword_Attack: mixer.clipAction(animations[9], group.current),
      Walk: mixer.clipAction(animations[10], group.current),
    };

    setTimeout(() => actions.current.Walk.play(), 2000);

    return () => animations.forEach((clip) => mixer.uncacheClip(clip));
  }, []);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Root} />
      <skinnedMesh
        material={materials.Warrior_Texture}
        geometry={nodes.Warrior002.geometry}
        skeleton={nodes.Warrior002.skeleton}
      />
    </group>
  );
}

useGLTF.preload("/Warrior.gltf");
