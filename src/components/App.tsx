import { Physics } from "@react-three/cannon";
import { Stars } from "@react-three/drei";
import React, { Suspense } from "react";
import { Canvas } from "react-three-fiber";
import { Game } from "snowtail/engine/Game";
import { Scene } from "snowtail/engine/Scene";
import SceneManager from "snowtail/engine/SceneManager";
import { SimpleScene } from "snowtail/scenes/simple-platformer";

interface Props {}

export const App: React.FC<Props> = () => {
  return (
    <Canvas shadowMap gl={{ alpha: true }} camera={{ position: [0, 10, 15] }}>
      <Game>
        <color attach="background" args={["#111111"] as any} />
        <hemisphereLight intensity={0.1} />
        <pointLight castShadow intensity={0.88} position={[10, 20, 0]} />
        <pointLight castShadow intensity={0.2} position={[50, 50, 50]} />
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
            </SceneManager>
          </Suspense>
        </Physics>
      </Game>
    </Canvas>
  );
};
