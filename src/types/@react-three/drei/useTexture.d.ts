import { Texture } from "three";

declare module "@react-three/drei" {
  export function useTexture<T>(url: T): T extends string ? Texture : Texture[];
}
