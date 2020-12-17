import { WorkerApi } from "@react-three/cannon";
import { useEffect, useRef } from "react";

export type WorkerVec = WorkerApi["position"];
export type WorkerVector = WorkerVec & {
  get: () => number[];
};
export const useWorkerVector = (
  vec: WorkerVec,
  initialValue: number[] = [0, 0, 0],
) => {
  const ref = useRef(initialValue);
  useEffect(() => {
    vec.subscribe((val) => (ref.current = val));
  }, [vec]);

  const vectorRef: WorkerVector = {
    ...vec,
    get: () => ref.current,
  };

  return vectorRef;
};
