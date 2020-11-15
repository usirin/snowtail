import React, { useMemo, useState } from "react";
import { CanvasContext, useFrame } from "react-three-fiber";
import {
  normalizeVector3,
  UseTransformProps,
} from "snowtail/engine/use-transform";
import { Object3D, Vector3 } from "three";
import create from "zustand";

export interface GameObjectContextValue {
  transform: UseTransformProps;
}

export interface GameObjectBehavior {
  (context: GameObjectContextValue): {
    Update: (
      context: GameObjectContextValue,
      delta: number,
      state: CanvasContext,
      ref: React.MutableRefObject<Object3D>,
    ) => void;
  };
}

export interface UseGameObjectProps {
  transform?: Partial<UseTransformProps>;
  behaviours?: Array<GameObjectBehavior>;
}

type Vector3Array = [number, number, number];

type TransformProps = {
  position: Vector3;
  scale: Vector3;
  rotation: Vector3;
  setPosition: (vector: Vector3 | Vector3Array) => void;
  setScale: (vector: Vector3 | Vector3Array) => void;
  setRotation: (vector: Vector3 | Vector3Array) => void;
};

const defaults = {
  position: new Vector3(0, 0, 0),
  scale: new Vector3(1, 1, 1),
  rotation: new Vector3(0, 0, 0),
};

const createTransform = (initialState: Partial<TransformProps> = {}) =>
  create<TransformProps>((set) => ({
    ...defaults,
    ...initialState,
    setPosition: (position: Vector3 | Vector3Array) =>
      set({ position: normalizeVector3(position) }),
    setScale: (scale: Vector3 | Vector3Array) =>
      set({ scale: normalizeVector3(scale) }),
    setRotation: (rotation: Vector3 | Vector3Array) =>
      set({ rotation: normalizeVector3(rotation) }),
  }));

export const useGameObject = (
  props: UseGameObjectProps = {},
  ref: React.MutableRefObject<Object3D>,
) => {
  const [useTransform] = useState(() => createTransform(props.transform));

  const { behaviours } = props;
  const behaviorInstances = useMemo(() => {
    if (!behaviours) {
      return [];
    }

    const transform = useTransform.getState();
    return behaviours.map((behaviour) => {
      return behaviour({ transform });
    });
  }, [behaviours, useTransform]);

  useFrame((state, delta) => {
    const context = { transform: useTransform.getState() };
    behaviorInstances.forEach((instance) => {
      instance.Update(context, delta, state, ref);
    });
  });

  return {
    transform: {
      ...useTransform,
    },
  };
};
