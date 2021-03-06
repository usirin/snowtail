import { WorkerApi } from "@react-three/cannon";
import { WorkerVector } from "snowtail/engine/use-worker-vector";

export interface PlayerApi {
  position: WorkerVector;
  rotation: WorkerVector;
  velocity: WorkerVector;
  applyForce: WorkerApi["applyForce"];
}
