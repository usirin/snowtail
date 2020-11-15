import React from "react";
import { Canvas as ThreeCanvas } from "react-three-fiber";

interface BoxProps {
  position: [number, number, number];
}

const Box: React.FC<BoxProps> = (props) => (
  <mesh scale={[1, 1, 1]} {...props}>
    <boxBufferGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color={Date.now() % 2 === 0 ? "hotpink" : "orange"} />
  </mesh>
);

export const Canvas = () => {
  return (
    <ThreeCanvas style={{ flex: "1 auto" }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </ThreeCanvas>
  );
};
