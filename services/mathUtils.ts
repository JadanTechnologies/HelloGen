import { ParticleTemplate } from '../types';

export const generateGeometryPositions = (template: ParticleTemplate, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;
    const u = Math.random();
    const v = Math.random();
    const w = Math.random(); // Extra random dimension

    switch (template) {
      case ParticleTemplate.SPHERE: {
        // Magical Globe World
        // Layering: Core, Surface, Atmosphere
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        
        let r = 3.0;
        const layer = w;

        if (layer < 0.15) {
          // Dense Core
          r = 1.0 + Math.random() * 1.5;
        } else if (layer < 0.85) {
          // Surface / Crust (Main Globe)
          r = 3.0 + (Math.random() - 0.5) * 0.1;
        } else {
          // Atmosphere / Clouds / Halo
          r = 3.2 + Math.random() * 0.8;
        }

        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ParticleTemplate.SATURN: {
        // 50% Planet, 50% Rings
        if (Math.random() > 0.5) {
          // Planet
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 1.8;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        } else {
          // Rings
          const angle = u * Math.PI * 2;
          const r = 2.4 + v * 2.5; // Wider rings
          x = r * Math.cos(angle);
          z = r * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.05; 
          
          // Tilt
          const tilt = 0.4;
          const yNew = y * Math.cos(tilt) - x * Math.sin(tilt);
          const xNew = y * Math.sin(tilt) + x * Math.cos(tilt);
          x = xNew;
          y = yNew;
        }
        break;
      }
      case ParticleTemplate.HEART: {
        const t = u * Math.PI * 2;
        const scale = 0.15;
        const rVar = 1 + (w - 0.5) * 0.2;
        x = scale * 16 * Math.pow(Math.sin(t), 3) * rVar;
        y = scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * rVar;
        z = (w - 0.5) * 2.0;
        break;
      }
      case ParticleTemplate.FLOWER: {
        const spread = 0.08;
        const r = spread * Math.sqrt(i) * 2.5;
        const theta = i * 2.39996;
        const petal = Math.sin(theta * 6); // 6 petals
        const yMod = petal * (r/4);

        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = yMod + (Math.random() - 0.5) * 0.5;
        y += r * 0.2; // Cup shape
        break;
      }
      case ParticleTemplate.GALAXY: 
      default: {
        // Realistic Spiral Galaxy
        // Core (dense sphere)
        if (i < count * 0.2) {
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = Math.pow(w, 3) * 1.5; // Concentrate near center
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta) * 0.6; // Flattened core
          z = r * Math.cos(phi);
        } else {
          // Arms
          const armCount = 3;
          const armIndex = i % armCount;
          // Radius distribution: mostly near center, fading out
          const radius = 0.5 + Math.pow(u, 0.8) * 6.0; 
          
          // Spiral angle
          const spiral = radius * 1.5; // Tightness
          const armOffset = (armIndex / armCount) * Math.PI * 2;
          const angle = spiral + armOffset;
          
          // Scatter (width of arms increases with radius)
          const scatterX = (Math.random() - 0.5) * (0.5 + radius * 0.3);
          const scatterY = (Math.random() - 0.5) * (0.2 + radius * 0.1); // Vertical thickness
          const scatterZ = (Math.random() - 0.5) * (0.5 + radius * 0.3);

          x = Math.cos(angle) * radius + scatterX;
          y = scatterY;
          z = Math.sin(angle) * radius + scatterZ;
        }
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};
