import { useCubeTexture } from "@react-three/drei";
import React from "react";
import { useThree } from "react-three-fiber";

export const SkyBox: React.FC = () => {
  const { scene } = useThree();
  const texture = useCubeTexture(
    [
      "textures/Space/space_left.jpg",
      "textures/Space/space_up.jpg",
      "textures/Space/space_front.jpg",
      "textures/Space/space_right.jpg",
      "textures/Space/space_down.jpg",
      "textures/Space/space_back.jpg",
    ].reverse(),
    { path: "https://www.babylonjs-playground.com/" },
  );

  console.log({ scene, texture });

  scene.background = texture;

  return null;
};
