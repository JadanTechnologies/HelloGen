import { AppState, ParticleTemplate } from './types';

export const INITIAL_APP_STATE: AppState = {
  template: ParticleTemplate.GALAXY,
  colorHue: 200, // Blue-ish
  particleCount: 15000,
  calmMode: false,
  showDebug: false,
};

export const PARTICLE_COUNT_DESKTOP = 20000;
export const PARTICLE_COUNT_MOBILE = 8000;

export const COLOR_PALETTES = [
  { name: 'Cyber', hue: 280 },
  { name: 'Ocean', hue: 200 },
  { name: 'Fire', hue: 20 },
  { name: 'Nature', hue: 120 },
  { name: 'White', hue: 0 }, // Saturation handling needed
];
