import { Texture } from "three";

export declare function useTexture(
  url: string extends any[] ? string[] : string,
): Texture | Texture[];

export declare namespace useTexture {
  let preload: (url: string) => undefined;
}
