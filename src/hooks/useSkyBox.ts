import { useCubeTexture } from "@react-three/drei";

export const useSkybox = () => {
  return useCubeTexture(
    [
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg",
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg",
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg",
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg",
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg",
      "https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg",
    ],
    { path: "" },
  );
};
