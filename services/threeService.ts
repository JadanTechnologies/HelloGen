import * as THREE from 'three';
import { AppState, GestureMetrics, ParticleTemplate } from '../types';
import { generateGeometryPositions } from './mathUtils';

const VERTEX_SHADER = `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uHandDist;
uniform vec3 uLeftHand;
uniform vec3 uRightHand;
uniform float uLeftTension;
uniform float uRightTension;
uniform float uPinchLeft;
uniform float uPinchRight;

attribute vec3 positionTarget;
attribute float sizeRandom;

varying vec3 vColor;
varying float vAlpha;

// Simplex noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; 
  vec3 x3 = x0 - D.yyy;      
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; 
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // 1. Morphing Base
  vec3 finalPos = mix(position, positionTarget, uMorph);

  // 2. Magical Ambient Float (Fluid-like movement)
  // Create a slow, rolling noise field that displaces particles
  float timeScale = uTime * 0.2;
  vec3 noiseInput = finalPos * 0.4 + vec3(timeScale);
  vec3 displacement = vec3(
    snoise(noiseInput),
    snoise(noiseInput + vec3(12.4, 3.2, 1.1)),
    snoise(noiseInput + vec3(5.1, 9.6, 2.3))
  );
  
  // Apply drift - more intense on outer edges
  float dist = length(finalPos);
  finalPos += displacement * (0.1 + dist * 0.05);

  // 3. Hand Interaction (Magnetic Force Field)
  vec3 lh = uLeftHand * 5.0; // Scale up from normalized 0..1 space to scene space
  vec3 rh = uRightHand * 5.0;
  
  float tension = (uLeftTension + uRightTension) * 0.5;

  // Interaction logic: 
  // If Pinching -> Strong Attractor (Implosion)
  // If High Tension (Fist) -> Jittery Contraction
  // If Open Hand -> Gentle Repulsion (Wind)
  
  float dLeft = distance(finalPos, lh);
  float dRight = distance(finalPos, rh);
  
  // Right Hand Interaction
  if (uPinchRight > 0.5) {
      // Magnetic implosion
      float force = smoothstep(3.0, 0.0, dRight); // Stronger near hand
      finalPos = mix(finalPos, rh, force * 0.3); // Suck in
  } else {
      // Gentle distortion/wind from hand
      float push = smoothstep(1.5, 0.0, dRight);
      finalPos += displacement * push * 0.5; // Agitate near hand
  }

  // Left Hand Interaction
  if (uPinchLeft > 0.5) {
      float force = smoothstep(3.0, 0.0, dLeft);
      finalPos = mix(finalPos, lh, force * 0.3);
  } else {
      float push = smoothstep(1.5, 0.0, dLeft);
      finalPos += displacement * push * 0.5;
  }

  // 4. Global Scale & Pulse (Breathing)
  // Scale increases when hands are far apart
  float handScale = 0.6 + uHandDist * 1.8; 
  finalPos *= handScale;
  
  // Tension Pulse: Fists make the whole system vibrate/contract
  float pulse = sin(uTime * 3.0) * 0.05 * (1.0 + tension * 4.0);
  finalPos *= 1.0 + pulse;

  // Calculate Screen Position
  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  
  // 5. Size & Sparkle Logic
  float sparkle = 1.0 + sin(uTime * 5.0 + sizeRandom * 100.0) * 0.5; // Twinkle effect
  
  // Particles are larger when high tension (energy surge)
  float tensionSize = 1.0 + tension * 1.5;
  
  gl_PointSize = (uSize * sizeRandom * sparkle * tensionSize) * (120.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  // 6. Color Data for Fragment
  // Fade out distant particles (Fog-like)
  float alphaFade = 1.0 - smoothstep(10.0, 20.0, -mvPosition.z);
  vAlpha = alphaFade;
  
  // Whiter core, colored edges
  vColor = vec3(1.0); 
}
`;

const FRAGMENT_SHADER = `
uniform vec3 uBaseColor;
varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft circular glow
  vec2 coord = 2.0 * gl_PointCoord - 1.0;
  float r = length(coord);
  
  if (r > 1.0) discard;

  // "Hot" center (Gaussian-ish)
  // 0.0 at center, 1.0 at edge
  // We want intense brightness at center (r=0) dropping off quickly
  float glow = pow(1.0 - r, 2.0); // Soft falloff
  float core = pow(1.0 - r, 8.0); // Sharp bright core

  // Combine base color with white core
  vec3 color = mix(uBaseColor, vec3(1.0), core * 0.8);
  
  // Add some bloom/halo
  float alpha = glow * vAlpha;
  
  gl_FragColor = vec4(color, alpha);
}
`;

export class ThreeService {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private particles: THREE.Points | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private currentTemplate: ParticleTemplate = ParticleTemplate.GALAXY;
  private targetPositions: Float32Array | null = null;
  private isMorphing = false;
  private morphStartTime = 0;
  private morphDuration = 1200; // ms (Slower morph for elegance)

  constructor(container: HTMLElement, initialCount: number) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    // Deep atmospheric fog
    this.scene.fog = new THREE.FogExp2(0x000000, 0.02);

    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.z = 7;

    this.initParticles(initialCount);
    
    window.addEventListener('resize', this.onResize);
  }

  private initParticles(count: number) {
    this.geometry = new THREE.BufferGeometry();
    
    const initialPos = generateGeometryPositions(this.currentTemplate, count);
    this.targetPositions = new Float32Array(initialPos);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(initialPos, 3));
    this.geometry.setAttribute('positionTarget', new THREE.BufferAttribute(this.targetPositions, 3));
    
    const randoms = new Float32Array(count);
    for(let i=0; i<count; i++) randoms[i] = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    this.geometry.setAttribute('sizeRandom', new THREE.BufferAttribute(randoms, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uSize: { value: 4.0 }, 
        uBaseColor: { value: new THREE.Color(0x44aaff) },
        uHandDist: { value: 0.5 },
        uLeftHand: { value: new THREE.Vector3(0,0,0) },
        uRightHand: { value: new THREE.Vector3(0,0,0) },
        uLeftTension: { value: 0 },
        uRightTension: { value: 0 },
        uPinchLeft: { value: 0 },
        uPinchRight: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.particles);
  }

  public update(metrics: GestureMetrics, appState: AppState, time: number) {
    if (!this.material || !this.particles) return;

    // Handle template switch morphing
    if (this.currentTemplate !== appState.template) {
      this.currentTemplate = appState.template;
      const count = this.geometry!.attributes.position.count;
      const newPos = generateGeometryPositions(this.currentTemplate, count);
      
      (this.geometry!.attributes.positionTarget as THREE.BufferAttribute).set(newPos);
      this.geometry!.attributes.positionTarget.needsUpdate = true;
      
      this.isMorphing = true;
      this.morphStartTime = time;
    }

    // Handle Morph Animation (Cubic ease in-out)
    if (this.isMorphing) {
      const elapsed = time - this.morphStartTime;
      let progress = elapsed / this.morphDuration;
      if (progress >= 1) {
        progress = 1;
        this.isMorphing = false;
        
        // Commit morph
        const targets = this.geometry!.attributes.positionTarget.array as Float32Array;
        (this.geometry!.attributes.position as THREE.BufferAttribute).set(targets);
        this.geometry!.attributes.position.needsUpdate = true;
        this.material.uniforms.uMorph.value = 0;
      } else {
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        this.material.uniforms.uMorph.value = ease;
      }
    }

    // Update Uniforms
    this.material.uniforms.uTime.value = time * 0.001;
    
    // Complex Color: Tension adds brightness/whiteness
    const baseColor = new THREE.Color().setHSL(appState.colorHue / 360, 0.9, 0.5);
    const tensionColor = new THREE.Color(0xffffff); // White hot
    const avgTension = (metrics.leftTension + metrics.rightTension) * 0.5;
    
    // Lerp base color to white based on tension
    const displayColor = baseColor.clone().lerp(tensionColor, avgTension * 0.6);
    this.material.uniforms.uBaseColor.value.lerp(displayColor, 0.1);

    // Smooth Hand Data
    const smoothing = 0.08;
    this.material.uniforms.uHandDist.value += (metrics.handDistance - this.material.uniforms.uHandDist.value) * smoothing;
    
    if (metrics.hasHands) {
      this.material.uniforms.uLeftHand.value.lerp(metrics.leftHandPos, smoothing);
      this.material.uniforms.uRightHand.value.lerp(metrics.rightHandPos, smoothing);
    }
    
    this.material.uniforms.uLeftTension.value += (metrics.leftTension - this.material.uniforms.uLeftTension.value) * smoothing;
    this.material.uniforms.uRightTension.value += (metrics.rightTension - this.material.uniforms.uRightTension.value) * smoothing;

    this.material.uniforms.uPinchLeft.value = metrics.isPinchingLeft ? 1 : 0;
    this.material.uniforms.uPinchRight.value = metrics.isPinchingRight ? 1 : 0;
    
    // Dynamic Rotation
    const baseRot = appState.calmMode ? 0.0001 : 0.0005;
    const tensionRot = avgTension * 0.005;
    this.particles.rotation.y += baseRot + tensionRot;
    this.particles.rotation.z += Math.sin(time * 0.001) * 0.0002; // Gentle swaying
    
    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.renderer || !this.camera) return;
    const parent = this.renderer.domElement.parentElement;
    if (parent) {
      this.renderer.setSize(parent.clientWidth, parent.clientHeight);
      this.camera.aspect = parent.clientWidth / parent.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  };

  public destroy() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    this.geometry?.dispose();
  }
}