import * as THREE from "three";

export interface AnimationAsset extends THREE.Group {
  animations?: THREE.AnimationClip[];
}
