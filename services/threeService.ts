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

  // 2. Magical Cosmic Float (Nebula Drift)
  float timeScale = uTime * 0.15;
  vec3 noisePos = finalPos * 0.5 + vec3(timeScale);
  
  // Curl noise approximation (derivative of noise)
  vec3 drift = vec3(
    snoise(noisePos + vec3(0.0, 0.0, 0.0)),
    snoise(noisePos + vec3(5.2, 1.3, 2.8)),
    snoise(noisePos + vec3(2.1, 4.4, 8.9))
  );
  
  // Particles breathe/drift based on their distance from center
  finalPos += drift * 0.15;

  // 3. Hand Interaction (Magical Swirl - Local)
  // Scale world coordinates to match view approx
  vec3 lh = uLeftHand; // Already in world space relative to object
  vec3 rh = uRightHand;
  
  // Right Hand Physics
  float dRight = distance(finalPos, rh);
  if (uPinchRight > 0.5) {
     float gravity = smoothstep(4.0, 0.0, dRight);
     finalPos = mix(finalPos, rh, gravity * 0.5); 
  } else {
     float influence = smoothstep(2.5, 0.0, dRight);
     if (influence > 0.0) {
        vec3 dir = normalize(finalPos - rh);
        vec3 swirl = cross(vec3(0.0, 0.0, 1.0), dir); 
        finalPos += swirl * influence * 0.2; 
        finalPos += dir * influence * 0.3; 
     }
  }

  // Left Hand Physics
  float dLeft = distance(finalPos, lh);
  if (uPinchLeft > 0.5) {
     float gravity = smoothstep(4.0, 0.0, dLeft);
     finalPos = mix(finalPos, lh, gravity * 0.5);
  } else {
     float influence = smoothstep(2.5, 0.0, dLeft);
     if (influence > 0.0) {
        vec3 dir = normalize(finalPos - lh);
        vec3 swirl = cross(vec3(0.0, 0.0, 1.0), dir);
        finalPos += swirl * influence * 0.2;
        finalPos += dir * influence * 0.3;
     }
  }

  // 4. Global Gestures
  // Tension Jitter (Energy overload)
  float tension = (uLeftTension + uRightTension) * 0.5;
  float jitter = snoise(finalPos * 2.0 + uTime * 10.0) * tension * 0.2;
  finalPos += vec3(jitter);

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  
  // 5. Visuals (Sparkle & Size)
  // Stars twinkle randomly
  float blink = snoise(vec3(sizeRandom * 10.0, uTime * 2.0, 0.0));
  float sparkle = 0.6 + 0.4 * blink;
  
  // High tension makes stars brighter and bigger
  float energySize = 1.0 + tension * 2.0;

  gl_PointSize = (uSize * sizeRandom * sparkle * energySize) * (150.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;

  // Fog effect
  vAlpha = 1.0 - smoothstep(15.0, 40.0, -mvPosition.z);
  vColor = vec3(1.0);
}
`;

const FRAGMENT_SHADER = `
uniform vec3 uBaseColor;
uniform float uTime;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 coord = 2.0 * gl_PointCoord - 1.0;
  float r = length(coord);
  if (r > 1.0) discard;

  // Star-like glow
  float core = exp(-r * 6.0); // Sharp bright point
  float glow = exp(-r * 2.0); // Soft halo
  
  vec3 finalColor = mix(uBaseColor, vec3(1.0, 1.0, 1.0), core);
  
  // Sparkle variation
  float alpha = (core * 2.0 + glow * 0.5) * vAlpha;

  gl_FragColor = vec4(finalColor, alpha);
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
  private isMorphing = false;
  private morphStartTime = 0;
  private morphDuration = 1000;

  constructor(container: HTMLElement, initialCount: number) {
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.z = 8; 

    this.initParticles(initialCount);
    window.addEventListener('resize', this.onResize);
  }

  private initParticles(count: number) {
    this.geometry = new THREE.BufferGeometry();
    const pos = generateGeometryPositions(this.currentTemplate, count);
    
    // Position Attributes
    this.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.geometry.setAttribute('positionTarget', new THREE.BufferAttribute(new Float32Array(pos), 3));
    
    // Random Attributes
    const randoms = new Float32Array(count);
    for(let i=0; i<count; i++) randoms[i] = Math.random();
    this.geometry.setAttribute('sizeRandom', new THREE.BufferAttribute(randoms, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uSize: { value: 3.5 },
        uBaseColor: { value: new THREE.Color(0x4488ff) },
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

    // Morph Logic
    if (this.currentTemplate !== appState.template) {
      this.currentTemplate = appState.template;
      const count = this.geometry!.attributes.position.count;
      const newPos = generateGeometryPositions(this.currentTemplate, count);
      
      (this.geometry!.attributes.positionTarget as THREE.BufferAttribute).set(newPos);
      this.geometry!.attributes.positionTarget.needsUpdate = true;
      
      this.isMorphing = true;
      this.morphStartTime = time;
    }

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
        // Cubic ease
        this.material.uniforms.uMorph.value = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }
    }

    // Update Uniforms
    this.material.uniforms.uTime.value = time * 0.001;

    // Viewport Calculations for Hand Mapping
    const viewHeight = 12.0;
    const aspect = this.camera.aspect;
    const viewWidth = viewHeight * aspect;

    const smooth = 0.1; // Smooth movement factor
    
    if (metrics.hasHands) {
      // 1. Move World (Pan)
      // Calculate center of both hands in World Space (approx)
      const cx = (metrics.leftHandPos.x + metrics.rightHandPos.x) / 2;
      const cy = (metrics.leftHandPos.y + metrics.rightHandPos.y) / 2;
      
      const targetWorldX = cx * (viewWidth * 0.8);
      const targetWorldY = cy * (viewHeight * 0.8);

      // Smoothly interpolate the entire particle system to follow hands
      this.particles.position.x += (targetWorldX - this.particles.position.x) * smooth;
      this.particles.position.y += (targetWorldY - this.particles.position.y) * smooth;

      // 2. Zoom (Scale)
      // Close hands (dist ~0) -> Zoom Out (Camera Z increases)
      // Far hands (dist ~1) -> Zoom In (Camera Z decreases)
      // Base Z is 8.0. Range: 4.0 (Close) to 14.0 (Far).
      // metrics.handDistance is approx 0.0 to 1.0
      // We want: Dist 0.8 -> Z 5. Dist 0.2 -> Z 12.
      const targetZ = 13.0 - (metrics.handDistance * 9.0);
      this.camera.position.z += (targetZ - this.camera.position.z) * smooth;

      // 3. Update Uniforms for Local Swirl (Relative to Object)
      // Since object moves, hands must be relative to object for local shaders
      const targetLx = (metrics.leftHandPos.x * viewWidth * 0.5) - this.particles.position.x;
      const targetLy = (metrics.leftHandPos.y * viewHeight * 0.5) - this.particles.position.y;
      const targetRx = (metrics.rightHandPos.x * viewWidth * 0.5) - this.particles.position.x;
      const targetRy = (metrics.rightHandPos.y * viewHeight * 0.5) - this.particles.position.y;

      this.material.uniforms.uLeftHand.value.x += (targetLx - this.material.uniforms.uLeftHand.value.x) * smooth;
      this.material.uniforms.uLeftHand.value.y += (targetLy - this.material.uniforms.uLeftHand.value.y) * smooth;
      
      this.material.uniforms.uRightHand.value.x += (targetRx - this.material.uniforms.uRightHand.value.x) * smooth;
      this.material.uniforms.uRightHand.value.y += (targetRy - this.material.uniforms.uRightHand.value.y) * smooth;
    } else {
      // Auto-return to center if hands lost
      this.particles.position.lerp(new THREE.Vector3(0,0,0), 0.05);
      this.camera.position.z += (8.0 - this.camera.position.z) * 0.05;
    }

    // Color
    const hue = appState.colorHue;
    const targetColor = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
    this.material.uniforms.uBaseColor.value.lerp(targetColor, 0.05);

    // Gestures
    this.material.uniforms.uHandDist.value += (metrics.handDistance - this.material.uniforms.uHandDist.value) * smooth;
    this.material.uniforms.uLeftTension.value += (metrics.leftTension - this.material.uniforms.uLeftTension.value) * smooth;
    this.material.uniforms.uRightTension.value += (metrics.rightTension - this.material.uniforms.uRightTension.value) * smooth;
    this.material.uniforms.uPinchLeft.value = metrics.isPinchingLeft ? 1 : 0;
    this.material.uniforms.uPinchRight.value = metrics.isPinchingRight ? 1 : 0;

    // Rotation
    this.particles.rotation.y += 0.002 + metrics.leftTension * 0.02;
    // this.particles.rotation.z = Math.sin(time * 0.0005) * 0.05; // Remove wobble for better globe control

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
