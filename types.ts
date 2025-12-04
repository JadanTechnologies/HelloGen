export enum ParticleTemplate {
  GALAXY = 'Galaxy',
  SPHERE = 'Sphere',
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn'
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface GestureMetrics {
  leftTension: number; // 0 (open) to 1 (closed)
  rightTension: number;
  handDistance: number; // 0 to 1 (normalized)
  isPinchingLeft: boolean;
  isPinchingRight: boolean;
  leftHandPos: Vec3; // Normalized -1 to 1
  rightHandPos: Vec3;
  hasHands: boolean;
}

export interface AppState {
  template: ParticleTemplate;
  colorHue: number; // 0-360
  particleCount: number;
  calmMode: boolean;
  showDebug: boolean;
}