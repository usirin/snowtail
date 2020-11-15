import { useBox } from "@react-three/cannon";
import React, { forwardRef, useEffect } from "react";
import {
  GameObjectBehavior,
  useGameObject,
} from "snowtail/engine/use-game-object";
import { Vector3 } from "three";

interface GameObjectProps {
  position: [x: number, y: number, z: number];
  behaviours?: Array<GameObjectBehavior>;
}

interface GameObjectRef {}

export const GameObject: React.FC<GameObjectProps> = forwardRef(
  (props, ref) => {
    const [meshGroupRef, api] = useBox(() => ({
      mass: 1,
      position: props.position,
    }));

    const { transform } = useGameObject(
      {
        transform: { position: new Vector3(...props.position) },
        behaviours: props.behaviours,
      },
      meshGroupRef!,
    );

    useEffect(() => {
      api.position.subscribe(([x, y, z]) => {
        transform.setState({ position: new Vector3(x, y, z) });
      });

      api.rotation.subscribe(([x, y, z]) => {
        transform.setState({ rotation: new Vector3(x, y, z) });
      });
    }, [api.position, api.rotation, transform]);

    useEffect(
      () =>
        transform.subscribe(({ position, rotation }) => {
          console.log(position, rotation);
          api.position.set(position.x, position.y, position.z);
          api.rotation.set(rotation.x, rotation.y, rotation.z);
        }),
      [api.position, api.rotation, transform],
    );

    return <group ref={meshGroupRef}>{props.children}</group>;
  },
);
