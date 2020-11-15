export interface Renderer {
  (element: HTMLElement, config: SnowtailConfig): void;
}

export interface SnowtailConfig {
  renderer: Renderer;
  root: HTMLElement;
}
