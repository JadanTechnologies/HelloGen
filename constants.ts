import { AppState, ParticleTemplate } from './types';

export const INITIAL_APP_STATE: AppState = {
  template: ParticleTemplate.GALAXY,
  colorHue: 240, // Deep Blue/Purple
  particleCount: 15000,
  calmMode: false,
  showDebug: false,
};

export const PARTICLE_COUNT_DESKTOP = 25000;
export const PARTICLE_COUNT_MOBILE = 10000;

export const COLOR_PALETTES = [
  { name: 'Nebula', hue: 270 },
  { name: 'Starlight', hue: 210 },
  { name: 'Supernova', hue: 15 },
  { name: 'Aurora', hue: 160 },
  { name: 'Void', hue: 0 },
];