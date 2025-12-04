import { ParticleTemplate } from '../types';

export const generateGeometryPositions = (template: ParticleTemplate, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let x = 0, y = 0, z = 0;
    const idx = i * 3;
    const u = Math.random();
    const v = Math.random();

    switch (template) {
      case ParticleTemplate.SPHERE: {
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 2.5;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case ParticleTemplate.SATURN: {
        // 60% Planet, 40% Rings
        if (Math.random() > 0.4) {
          // Planet (Sphere)
          const theta = 2 * Math.PI * u;
          const phi = Math.acos(2 * v - 1);
          const r = 1.8;
          x = r * Math.sin(phi) * Math.cos(theta);
          y = r * Math.sin(phi) * Math.sin(theta);
          z = r * Math.cos(phi);
        } else {
          // Rings (Disk)
          const angle = u * Math.PI * 2;
          // Radius between 2.2 and 4.0
          const r = 2.4 + v * 2.0;
          x = r * Math.cos(angle);
          z = r * Math.sin(angle);
          y = (Math.random() - 0.5) * 0.1; // Thin disk
          
          // Tilt the rings
          const tilt = Math.PI / 6; // 30 degrees
          const yNew = y * Math.cos(tilt) - x * Math.sin(tilt);
          const xNew = y * Math.sin(tilt) + x * Math.cos(tilt);
          x = xNew;
          y = yNew;
        }
        break;
      }
      case ParticleTemplate.HEART: {
        // Parametric Heart
        const t = u * Math.PI * 2; // angle
        // Basic heart shape formula
        // x = 16sin^3(t)
        // y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        const scale = 0.12;
        // Add volume
        const rVar = 1 + (Math.random() - 0.5) * 0.2;
        
        x = scale * 16 * Math.pow(Math.sin(t), 3) * rVar;
        y = scale * (13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * rVar;
        z = (Math.random() - 0.5) * 1.5;
        
        // Random scatter inside
        x += (Math.random() - 0.5) * 0.2;
        y += (Math.random() - 0.5) * 0.2;
        break;
      }
      case ParticleTemplate.FLOWER: {
        // Phyllotaxis
        const spread = 0.08;
        const r = spread * Math.sqrt(i) * 2;
        const theta = i * 2.39996; // Golden angle
        
        // Petal curve
        const petal = Math.sin(theta * 5); 
        const yMod = petal * 0.5 * (r/5);

        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = yMod + (Math.random() - 0.5) * 0.5;
        
        // Cup shape
        y += r * 0.3;
        break;
      }
      case ParticleTemplate.GALAXY: 
      default: {
        // Spiral
        const armCount = 3;
        const armIndex = i % armCount;
        const radius = Math.random() * 4;
        const spin = radius * 2;
        const angle = (armIndex / armCount) * Math.PI * 2 + spin;
        const randomOffset = 0.3 + (radius * 0.1);
        
        x = Math.cos(angle) * radius + (Math.random() - 0.5) * randomOffset;
        y = (Math.random() - 0.5) * (1 - radius/6) * 0.8; 
        z = Math.sin(angle) * radius + (Math.random() - 0.5) * randomOffset;
        break;
      }
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
  }

  return positions;
};