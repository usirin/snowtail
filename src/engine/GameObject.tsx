import React, { forwardRef } from "react";
import { Object3D } from "three";

interface GameObjectProps {
  position?: [x: number, y: number, z: number];
  children: React.ReactNode;
}

export const GameObject = forwardRef<Object3D | undefined, GameObjectProps>(
  (props, ref) => {
    return <group ref={ref}>{props.children}</group>;
  },
);
