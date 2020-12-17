import { useTexture } from "@react-three/drei";
import { usePrevious } from "pkg/use-previous";
import { MeshStandardMaterial } from "three";
import * as THREE from "three";
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "react-three-fiber";
import { useGLTF } from "@react-three/drei/useGLTF";

import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import model from "./Warrior.glb";
import textureURL from "../Warrior_Texture.png";
import swordTextureURL from "../Warrior_Sword_Texture.png";

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
  | "Idle_Weapon"
  | "PickUp"
  | "Punch"
  | "RecieveHit"
  | "RecieveHit_Attacking"
  | "Run"
  | "Sword_Attack"
  | "Walk";
type GLTFActions = Record<ActionName, THREE.AnimationAction>;

interface Props {
  action?: ActionName;
}

export const Warrior: React.FC<Props> = ({ action = "Idle_Weapon" }) => {
  const group = useRef<THREE.Group>();
  const { nodes, animations, materials, scene } = useGLTF(model) as GLTFResult;
  console.log({ materials, scene });

  console.log("g", group);

  const actions = useRef<GLTFActions>();
  const [mixer] = useState(() => new THREE.AnimationMixer(nodes.Warrior002));
  useEffect(() => void console.log("grp", group.current), []);
  useFrame((state, delta) => mixer.update(delta));
  useEffect(() => {
    actions.current = {
      Death: mixer.clipAction(animations[0], group.current),
      Idle: mixer.clipAction(animations[1], group.current),
      Idle_Weapon: mixer.clipAction(animations[2], group.current),
      PickUp: mixer.clipAction(animations[3], group.current),
      Punch: mixer.clipAction(animations[4], group.current),
      RecieveHit: mixer.clipAction(animations[5], group.current),
      RecieveHit_Attacking: mixer.clipAction(animations[6], group.current),
      Run: mixer.clipAction(animations[7], group.current),
      Sword_Attack: mixer.clipAction(animations[8], group.current),
      Walk: mixer.clipAction(animations[9], group.current),
    };

    nodes.Warrior002.position.y -= 1.5;

    return () => animations.forEach((clip) => mixer.uncacheClip(clip));
  }, [
    animations,
    materials.Warrior_Texture.color,
    mixer,
    nodes.Warrior002.position,
  ]);

  useEffect(() => {
    if (actions.current?.[action]) {
      actions.current[action].play();
    }
  }, [action]);

  const prevAction = usePrevious(action);
  useEffect(() => {
    if (action) {
      const currentAction = actions.current![action];
      currentAction.enabled = true;
      if (prevAction) {
        const oldAction = actions.current![prevAction];
        oldAction.paused = true;
        currentAction.paused = false;
        currentAction.crossFadeFrom(oldAction, 0.15, true);
      }
      currentAction.play();
    }
  }, [actions, prevAction, action]);

  console.log(nodes, materials);

  const [texture, swordTexture] = useTexture([textureURL, swordTextureURL]);
  texture.flipY = false;
  swordTexture.flipY = false;
  useEffect(() => {
    if (texture) {
      const material = new MeshStandardMaterial({ map: texture });
      material.color.convertLinearToSRGB();
      Object.keys(nodes).forEach((key) => {
        if (key !== "Warrior_Sword") {
          nodes[key].material = material;
          nodes[key].castShadow = true;
          nodes[key].receiveShadow = true;
        }
      });
    }

    if (swordTexture) {
      const key = "Warrior_Sword";
      nodes[key].material = materials.Warrior_Sword_Texture;
      nodes[key].castShadow = true;
      nodes[key].receiveShadow = false;
    }
  }, [
    materials.Warrior_Sword_Texture,
    materials.Warrior_Texture,
    nodes,
    swordTexture,
    texture,
  ]);

  return (
    <group ref={group} dispose={null}>
      <meshStandardMaterial wireframe />
      <group position={[0, -1.5, 0]}>
        <primitive object={nodes.Root} />
        <skinnedMesh
          geometry={nodes.Warrior002.geometry}
          skeleton={nodes.Warrior002.skeleton}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial mwap={texture} skinning />
        </skinnedMesh>
      </group>
    </group>
  );
};

useGLTF.preload("/Warrior.glb");
