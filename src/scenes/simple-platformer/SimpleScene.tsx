import { useBox } from "@react-three/cannon";
import React, { useEffect, useRef } from "react";
import { useFrame } from "react-three-fiber";
import lerp from "lerp";

enum Layers {
  Player = 1,
  Ground = 2,
  Floating = 4,
}

const Ground: React.FC<{
  position?: [number, number, number];
  scale?: [number, number, number];
}> = ({ scale = [15, 1, 3], position = [0, 0, 0] }) => {
  const [ref] = useBox(() => ({
    type: "Kinematic",
    args: scale,
    position,
    collisionFilterGroup: Layers.Ground,
    onCollide: () => void console.log("baaaar"),
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxBufferGeometry args={[15, 1, 3]} />
      <meshPhongMaterial attach="material" color="gray" />
    </mesh>
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
  const isPressed = useRef({ pressed: false });
  useWindowListener("keydown", (event) => {
    if (event.key === key) {
      isPressed.current.pressed = true;
    }
  });
  useWindowListener("keyup", (event) => {
    if (event.key === key) {
      isPressed.current.pressed = false;
    }
  });

  return isPressed.current;
};

const Coin: React.FC<{
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
    // console.log(rot.current, "2");
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

const Character: React.FC<{
  position?: [number, number, number];
}> = ({ position: positionProp = [0, 5, 0] }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: positionProp,
    rotation: [0, 0, 0],
    fixedRotation: true,
    collisionFilterGroup: Layers.Player,
    collisionFilterMask: Layers.Floating | Layers.Ground,
    onCollide: () => void console.log("foooooo"),
  }));

  const position = useRef(positionProp);
  useEffect(
    () =>
      void api.position.subscribe(
        (v) => (position.current = v as [number, number, number]),
      ),
    [api.position],
  );

  const velocity = useRef([0, 0, 0]);
  useEffect(() => void api.velocity.subscribe((v) => (velocity.current = v)), [
    api.velocity,
  ]);

  const rotation = useRef([0, Math.PI, 0]);
  useEffect(() => {
    api.rotation.subscribe((r) => {
      rotation.current = r;
    });
  }, [api.rotation]);

  const leftKey = useKeyBind("a");
  const rightKey = useKeyBind("d");
  const spaceKey = useKeyBind(" ");

  useFrame((state, delta) => {
    if (spaceKey.pressed && Math.abs(+velocity.current[1].toFixed(2)) < 0.15) {
      api.velocity.set(velocity.current[0], 4.5, velocity.current[2]);
    }

    if (leftKey.pressed && rightKey.pressed) {
      return;
    } else if (leftKey.pressed) {
      api.position.set(
        position.current[0] - delta,
        position.current[1],
        position.current[2],
      );
      api.rotation.set(0, Math.PI, 0);
      // cameraRef.current.position.z *= -1;
    } else if (rightKey.pressed) {
      api.position.set(
        position.current[0] + delta,
        position.current[1],
        position.current[2],
      );
      api.rotation.set(0, 0, 0);
    }

    // state.camera.position.x = position.current[0];

    state.camera.position.x = lerp(
      state.camera.position.x,
      position.current[0],
      0.05,
    );

    state.camera.position.y = lerp(
      state.camera.position.y,
      positionProp[1],
      0.05,
    );
    // state.camera.lookAt(...position.current);
    state.camera.updateMatrixWorld();
  });

  return (
    <group ref={ref} castShadow>
      <mesh castShadow receiveShadow>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshPhongMaterial attach="material" color="#ccc" />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 0, 0]}>
        <boxBufferGeometry args={[1, 0.2, 1]} />
        <meshPhongMaterial attach="material" color="#ccc" />
      </mesh>
    </group>
  );
};

const Platforms = () => {
  return (
    <group>
      <Ground position={[10, 2, 0]} />
    </group>
  );
};

export const SimpleScene = () => {
  return (
    <>
      <Character />
      <Platforms />
      <Ground />
      {/*<Coin position={[0, 2, 0]} />*/}
    </>
  );
};
