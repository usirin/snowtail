import { useBox, usePlane } from "@react-three/cannon";
import { Plane } from "@react-three/drei";
import lerp from "lerp";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "react-three-fiber";
import {
  Kimana,
  AnimationAction as KimanaActions,
} from "snowtail/components/Kimana/Kimana";
import { Player } from "snowtail/components/Player/Player";
import { GameObject } from "snowtail/engine/GameObject";
import { useGame } from "snowtail/engine/use-game";

enum Layers {
  Player = 0b1,
  Ground,
  Floating,
}

const Ground: React.FC = () => {
  const [ref] = usePlane(() => ({
    args: [1000, 1000],
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    collisionFilterGroup: Layers.Ground,
  }));

  return (
    <Plane receiveShadow args={[1000, 1000]} ref={ref}>
      <meshStandardMaterial color="#ccc" />
    </Plane>
  );
};

function useWindowListener<K extends keyof WindowEventMap>(
  name: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
) {
  useEffect(() => {
    window.addEventListener(name, listener);
    return () => {
      window.removeEventListener(name, listener);
    };
  }, [listener, name]);
}

const useKeyBind = (key: string) => {
  const [isPressed, setIsPressed] = useState(false);
  useWindowListener("keydown", (event) => {
    if (event.key === key) {
      setIsPressed(true);
    }
  });
  useWindowListener("keyup", (event) => {
    if (event.key === key) {
      setIsPressed(false);
    }
  });

  return { pressed: isPressed };
};

const Character: React.FC<{
  position?: [number, number, number];
}> = ({ position: positionProp = [0, 10, 0] }) => {
  const [ref, api] = useBox(() => ({
    args: [1, 3, 1],
    mass: 50,
    position: positionProp,
    rotation: [0, Math.PI / 2, 0],
    fixedRotation: true,
    type: "Dynamic",
    collisionFilterGroup: Layers.Player,
    collisionFilterMask: Layers.Floating | Layers.Ground,
    onCollide: (event) => void console.log("foooooo", event),
  }));

  const kimanaAction = useRef<KimanaActions>("Idle");

  const position = useRef(positionProp);
  useEffect(() => {
    api.position.subscribe((v) => {
      const pos = v as [number, number, number];
      position.current = pos;
    });
  }, [api.position]);

  const velocity = useRef([0, 0, 0]);
  useEffect(() => {
    api.velocity.subscribe((v) => {
      velocity.current = v;
    });
  }, [api.velocity]);

  const rotation = useRef([0, Math.PI / 2, 0]);
  useEffect(() => {
    api.rotation.subscribe((r) => {
      rotation.current = r;
    });
  }, [api.rotation]);

  const leftKey = useKeyBind("a");
  const rightKey = useKeyBind("d");
  const downKey = useKeyBind("s");

  const [animationState, setAnimationState] = useState<KimanaActions>("Idle");

  const { managers } = useGame();

  useFrame((state, delta) => {
    const velocityY = +velocity.current[1].toFixed(2);
    const jumpKey = managers.input.getKey("Jump");

    if (jumpKey.justPressed && Math.abs(velocityY) < 0.05) {
      api.velocity.set(velocity.current[0], 2.5, velocity.current[2]);
    }

    if (velocityY < 0) {
      api.velocity.set(
        velocity.current[0],
        velocity.current[1] + -10 * 1.5 * delta,
        velocity.current[2],
      );
    } else if (velocityY > 0 && !jumpKey.pressed) {
      api.velocity.set(
        velocity.current[0],
        velocity.current[1] + -10 * 1 * delta,
        velocity.current[2],
      );
    }

    if (leftKey.pressed && rightKey.pressed) {
      return;
    } else if (leftKey.pressed) {
      const newX = position.current[0] - delta * 5;
      api.position.set(newX, position.current[1], position.current[2]);
      api.rotation.set(0, -Math.PI / 2, 0);
      // cameraRef.current.position.z *= -1;
    } else if (rightKey.pressed) {
      const newX = position.current[0] + delta * 5;
      api.position.set(newX, position.current[1], position.current[2]);
      api.rotation.set(0, Math.PI / 2, 0);
    } else if (downKey.pressed) {
      api.rotation.set(0, 0, 0);
    }
    state.camera.position.x = lerp(
      state.camera.position.x,
      position.current[0],
      0.1,
    );

    // state.camera.position.y = lerp(state.camera.position.y, cameraY, delta);
    state.camera.lookAt(...position.current);
  });

  return (
    <GameObject ref={ref}>
      <Kimana />
    </GameObject>
  );
};

const Platform: React.FC<{
  position: [number, number, number];
  scale?: [number, number, number];
}> = ({ position, scale = [15, 1, 2] }) => {
  const [ref] = useBox(() => ({
    type: "Kinematic",
    args: scale,
    position,
    collisionFilterGroup: Layers.Ground,
    onCollide: (...args) => void console.log("platform collision", args),
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxBufferGeometry args={scale} />
      <meshPhongMaterial attach="material" color="gray" />
    </mesh>
  );
};

const Platforms = () => {
  return (
    <group>
      <Platform position={[0, 2, 0]} />
      <Platform position={[10, 4, 0]} />
    </group>
  );
};

export const SimpleScene = () => {
  return (
    <>
      <Player />
      <Platforms />
      <Ground />
      {/*<Coin position={[0, 2, 0]} />*/}
    </>
  );
};
