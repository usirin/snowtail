import { useBox } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import React, { useRef, useState } from "react";
import { useSpring, animated as a } from "react-spring/three";
import { useFrame } from "react-three-fiber";
import { Mesh } from "three";

interface GameCardProps {
  position: [number, number, number];
  scale?: [number, number, number];
  hovered: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  args?: [x: number, y: number, z: number];
}

export const GameCard: React.FC<GameCardProps> = ({
  position,
  scale = [1, 1, 1],
  onPointerOver,
  onPointerOut,
  hovered,
  args = [6.96 / 2, 0.02, 10.32 / 2],
}) => {
  // const meshRef = useRef<Mesh>();
  const [meshRef] = useBox(() => ({
    mass: 1,
    position,
    scale,
    args,
  }));

  // const props: { scale: [number, number, number] } = useSpring({
  //   scale: hovered ? [scale[0] * 1.5, scale[1] * 1.5, scale[2] * 1.5] : scale,
  // } as any) as { scale: [number, number, number] };

  let [frontTexture, backTexture] = useTexture([
    "https://images-na.ssl-images-amazon.com/images/I/61YXNhfzlzL._SL1012_.jpg",
    "https://vignette3.wikia.nocookie.net/yugioh/images/9/94/Back-Anime-2.png/revision/latest?cb=20110624090942",
  ]);

  return (
    <a.mesh
      receiveShadow
      castShadow
      ref={meshRef}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <boxBufferGeometry attach="geometry" args={args} />
      <meshPhongMaterial color="black" attachArray="material" />
      <meshPhongMaterial color="black" attachArray="material" />
      <meshPhongMaterial map={frontTexture} attachArray="material" />
      <meshPhongMaterial map={backTexture} attachArray="material" />
      <meshPhongMaterial color="black" attachArray="material" />
      <meshPhongMaterial color="black" attachArray="material" />
    </a.mesh>
  );
};
