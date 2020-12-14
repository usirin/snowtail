import { useBox } from "@react-three/cannon";
import React, { useEffect, useRef } from "react";
import { useFrame } from "react-three-fiber";

export const Coin: React.FC<{
  position?: [number, number, number];
}> = ({ position = [0, 0, 0] }) => {
  const [ref, api] = useBox(() => ({
    position,
    type: "Kinematic",
    rotation: [0, 0, Math.PI / 2],
  }));

  const pos = useRef(position);
  useEffect(() => {
    api.position.subscribe((p) => {
      pos.current = p as [number, number, number];
    });
  }, [api.position]);

  const rot = useRef([0, 0, 0]);
  useEffect(() => {
    api.rotation.subscribe((r) => {
      rot.current = r as [number, number, number];
    });
  }, [api.rotation]);

  useFrame((state, delta) => {
    api.rotation.set(
      rot.current[0],
      (rot.current[1] + delta * 3) % Math.PI,
      rot.current[2],
    );
  });

  return (
    <group ref={ref}>
      <mesh>
        <cylinderBufferGeometry args={[0.75, 0.75, 0.2, 64]} />
        <meshPhongMaterial color="yellow" />
      </mesh>
    </group>
  );
};
