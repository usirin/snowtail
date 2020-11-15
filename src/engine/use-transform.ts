import { useLazyRef } from "pkg/use-lazy-ref";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import create, { UseStore } from "zustand";

export type UseTransformProps = {
  position: Vector3;
  scale: Vector3;
  rotation: Vector3;
  setPosition: (vector: Vector3 | Vector3Array) => void;
  setScale: (vector: Vector3 | Vector3Array) => void;
  setRotation: (vector: Vector3 | Vector3Array) => void;
};

type Vector3Array = [number, number, number];

export const normalizeVector3 = (vector: Vector3 | Vector3Array) =>
  Array.isArray(vector) ? new Vector3(...vector) : vector;

const defaults = {
  position: new Vector3(0, 0, 0),
  scale: new Vector3(1, 1, 1),
  rotation: new Vector3(0, 0, 0),
};

export const useCreateTransform = (
  initialState: Partial<UseTransformProps> = {},
): UseStore<UseTransformProps> => {
  const store = useLazyRef(() =>
    create<UseTransformProps>((set) => ({
      ...defaults,
      ...initialState,
      setPosition: (position: Vector3 | Vector3Array) =>
        set({ position: normalizeVector3(position) }),
      setScale: (scale: Vector3 | Vector3Array) =>
        set({ scale: normalizeVector3(scale) }),
      setRotation: (rotation: Vector3 | Vector3Array) =>
        set({ rotation: normalizeVector3(rotation) }),
    })),
  );

  return store.current;
};
