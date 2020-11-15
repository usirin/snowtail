import { useMachine } from "@xstate/react";
import { createJumpingMachine, createMovingMachine } from "snowtail/machines";
import { Vector3 } from "three";

interface UseCharacterState {
  velocity: Vector3;
  jumping: boolean;
  moving: boolean;
}

interface UseCharacterActions {
  jump: () => void;
  moveForward: () => void;
  moveBack: () => void;
  moveLeft: () => void;
  moveRight: () => void;
}

export const useCharacter = (): [UseCharacterState, UseCharacterActions] => {
  const [moving, sendMoving] = useMachine(createMovingMachine());
  const [jumping, sendJumping] = useMachine(createJumpingMachine());

  const moveForward = () =>
    sendMoving({ type: "MOVE", velocity: new Vector3(0, 0, 1) });
  const moveBack = () =>
    sendMoving({ type: "MOVE", velocity: new Vector3(0, 0, -1) });
  const moveLeft = () =>
    sendMoving({ type: "MOVE", velocity: new Vector3(-1, 0, 0) });
  const moveRight = () =>
    sendMoving({ type: "MOVE", velocity: new Vector3(1, 0, 0) });
  const jump = () => sendJumping("JUMP");

  return [
    {
      velocity: moving.context.velocity,
      jumping: jumping.value === "on",
      moving: moving.value === "on",
    },
    {
      jump,
      moveForward,
      moveBack,
      moveLeft,
      moveRight,
    },
  ];
};
