import { Physics } from "@react-three/cannon";
import { OrbitControls, PerspectiveCamera, Stars } from "@react-three/drei";
import React, { Suspense, useRef } from "react";
import { useThree } from "react-three-fiber";
import { MoveWithKeyboard } from "snowtail/behaviours/move-with-keyboard";
import { Plane } from "snowtail/components/Plane";
import { Game } from "snowtail/engine/Game";
import { GameObject } from "snowtail/engine/GameObject";
import { Scene } from "snowtail/engine/Scene";
import SceneManager from "snowtail/engine/SceneManager";
import { GameObjectBehavior } from "snowtail/engine/use-game-object";
import { SimpleScene } from "snowtail/scenes/simple-platformer";
import { MathUtils, Vector3 } from "three";

interface Props {}

const FollowObject: GameObjectBehavior = () => ({
  Update: (context, delta, state, ref) => {
    state.camera.position.y = MathUtils.clamp(
      state.camera.position.y,
      context.transform.position.y,
      Number.POSITIVE_INFINITY,
    );

    const relativeCamOffset = new Vector3(0, 5, 40);
    // let newPos = context.transform.position
    //   .clone()
    //   .add(
    //     new Vector3()
    //       .subVectors(state.camera.position, context.transform.position)
    //       .normalize()
    //       .multiplyScalar(20),
    //   );
    const newPos = relativeCamOffset.applyMatrix4(ref.current.matrixWorld);
    state.camera.position.x = newPos.x;
    state.camera.position.y = newPos.y;
    state.camera.position.z = newPos.z;
    state.camera.lookAt(ref.current.position);
  },
});

const Player = () => {
  return (
    <GameObject
      position={[0, 3.5, 0]}
      behaviours={[FollowObject, MoveWithKeyboard]}
    >
      <mesh>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshPhongMaterial attach="material" color="magenta" />
      </mesh>
    </GameObject>
  );
};

export const App: React.FC<Props> = () => {
  return (
    <Game cameraProps={{ position: [0, 2.5, 30], isOrthographicCamera: false }}>
      <color attach="background" args={["#111111"] as any} />
      <hemisphereLight intensity={0.1} />
      <pointLight castShadow intensity={1.12} position={[2, 2, 2]} />
      <Stars
        radius={100} // Radius of the inner sphere (default=100)
        depth={50} // Depth of area where stars should fit (default=50)
        count={5000} // Amount of stars (default=5000)
        factor={4} // Size factor (default=4)
        saturation={0} // Saturation 0-1 (default=0)
        fade // Faded dots (default=false)
      />
      <Physics>
        <Suspense fallback={null}>
          <SceneManager defaultScene="simple">
            <Scene id="simple">
              <SimpleScene />
            </Scene>
            <Scene id="first">
              <Plane args={[100, 100] as [number, number]} />
              <Player />
            </Scene>
            <Scene id="second">
              <mesh castShadow position={[1, 3.5, 1]}>
                <boxBufferGeometry args={[1, 1, 1]} />
                <meshPhongMaterial attach="material" color="magenta" />
              </mesh>
            </Scene>
          </SceneManager>
        </Suspense>
      </Physics>
      <OrbitControls enableKeys />
    </Game>
  );
};
