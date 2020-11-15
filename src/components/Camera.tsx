import React, { useEffect, useRef } from "react";
import {
  useFrame,
  useThree,
  Camera as R3FCamera,
  extend,
  ReactThreeFiber,
} from "react-three-fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

extend({ OrbitControls });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}

const Camera = (props) => {
  const cameraRef = useRef<R3FCamera>();
  const controlsRef = useRef<OrbitControls>();
  const { gl, camera, setDefaultCamera } = useThree();
  useEffect(() => {
    if (cameraRef.current) {
      setDefaultCamera(cameraRef.current);
    }
  }, [setDefaultCamera]);

  useFrame(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.updateMatrixWorld();
      controlsRef.current.update();
    }
  });

  return (
    <>
      <perspectiveCamera {...props} ref={cameraRef} position={[0, -10, 10]} />
      <orbitControls
        autoRotate
        enableDamping
        ref={controlsRef}
        args={[camera, gl.domElement]}
        dampingFactor={0.2}
        rotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 3}
      />
    </>
  );
};
