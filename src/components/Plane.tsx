import { PlaneProps, usePlane } from "@react-three/cannon";
import React from "react";

type Props = PlaneProps & {
  args:
    | [number, number]
    | [number, number, number]
    | [number, number, number, number];
};

export const Plane: React.FC<Props> = (props) => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -0.02, 0],
    ...props,
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeBufferGeometry attach="geometry" args={props.args} />
      <shadowMaterial attach="material" color="#111111" />
      <meshPhongMaterial attach="material" />
    </mesh>
  );
};
