import { AppState, ParticleTemplate } from './types';

export const INITIAL_APP_STATE: AppState = {
  template: ParticleTemplate.SPHERE,
  colorHue: 200, // Cyan/Blue World
  particleCount: 15000,
  calmMode: false,
  showDebug: false,
};

export const PARTICLE_COUNT_DESKTOP = 25000;
export const PARTICLE_COUNT_MOBILE = 10000;

export const COLOR_PALETTES = [
  { name: 'Nebula', hue: 270 },
  { name: 'Ocean', hue: 200 },
  { name: 'Starlight', hue: 210 },
  { name: 'Supernova', hue: 15 },
  { name: 'Aurora', hue: 160 },
  { name: 'Void', hue: 0 },
];
