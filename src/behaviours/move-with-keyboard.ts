import { GameObjectBehavior } from "snowtail/engine/use-game-object";
import { Vector3 } from "three";

export const MoveWithKeyboard: GameObjectBehavior = () => {
  const move = {
    w: false,
    a: false,
    s: false,
    d: false,
    jump: false,
  };

  window.addEventListener("keydown", (event) => {
    if (event.key === "w") {
      move.w = true;
    }
    if (event.key === "a") {
      move.a = true;
    }
    if (event.key === "s") {
      move.s = true;
    }
    if (event.key === "d") {
      move.d = true;
    }
    if (event.key === " ") {
      move.jump = true;
    }
  });

  window.addEventListener("keyup", (event) => {
    if (event.key === "w") {
      move.w = false;
    }
    if (event.key === "a") {
      move.a = false;
    }
    if (event.key === "s") {
      move.s = false;
    }
    if (event.key === "d") {
      move.d = false;
    }
    // if (event.key === " ") {
    //   move.jump = false;
    // }
  });

  const Update: ReturnType<GameObjectBehavior>["Update"] = (context, delta) => {
    delta = delta * 10;

    if (move.w) {
      console.log("wassup");
      context.transform.setPosition(
        context.transform.position.add(new Vector3(0, 0, delta)),
      );
    }

    if (move.a) {
      console.log("wassup a");
      context.transform.setRotation(
        context.transform.rotation.add(new Vector3(0, delta, 0)),
      );
    }

    if (move.d) {
      context.transform.setPosition(
        context.transform.position.add(new Vector3(-delta, 0, 0)),
      );
    }

    if (move.s) {
      context.transform.setPosition(
        context.transform.position.add(new Vector3(0, 0, -delta)),
      );
    }

    if (move.jump) {
      /// ...
      move.jump = false;
    }
  };

  return {
    Update,
  };
};
