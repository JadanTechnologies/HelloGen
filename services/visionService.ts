import { FilesetResolver, HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { GestureMetrics } from '../types';

export class VisionService {
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  private animationFrameId: number | null = null;

  constructor(private onMetrics: (metrics: GestureMetrics) => void) {}

  async initialize(videoElement: HTMLVideoElement) {
    this.video = videoElement;
    
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2
    });

    this.startLoop();
  }

  private startLoop = () => {
    if (this.video && this.handLandmarker) {
      if (this.video.currentTime !== this.lastVideoTime && this.video.readyState >= 2) {
        this.lastVideoTime = this.video.currentTime;
        const result = this.handLandmarker.detectForVideo(this.video, performance.now());
        
        const metrics = this.processLandmarks(result.landmarks);
        this.onMetrics(metrics);
      }
    }
    this.animationFrameId = requestAnimationFrame(this.startLoop);
  };

  private processLandmarks(landmarks: NormalizedLandmark[][]): GestureMetrics {
    const metrics: GestureMetrics = {
      leftTension: 0,
      rightTension: 0,
      handDistance: 0.5, // Default neutral
      isPinchingLeft: false,
      isPinchingRight: false,
      leftHandPos: { x: -0.5, y: 0, z: 0 },
      rightHandPos: { x: 0.5, y: 0, z: 0 },
      hasHands: landmarks.length > 0
    };

    if (landmarks.length === 0) return metrics;

    // Helper to calc distance 3D
    const dist = (a: NormalizedLandmark, b: NormalizedLandmark) => {
      return Math.sqrt(
        Math.pow(a.x - b.x, 2) + 
        Math.pow(a.y - b.y, 2) + 
        Math.pow(a.z - b.z, 2)
      );
    };

    // Helper to detect palm center (avg of wrist and finger bases)
    const getPalmCenter = (lm: NormalizedLandmark[]) => {
      // 0 is wrist, 5 is index base, 17 is pinky base
      return {
        x: (lm[0].x + lm[5].x + lm[17].x) / 3,
        y: (lm[0].y + lm[5].y + lm[17].y) / 3,
        z: (lm[0].z + lm[5].z + lm[17].z) / 3
      };
    };

    let leftHand: NormalizedLandmark[] | null = null;
    let rightHand: NormalizedLandmark[] | null = null;

    // Simple heuristic: Left side of screen is "Left Hand" (mirrored input usually)
    // MediaPipe hands output handedness, but for this simplified logic we sort by x coord
    // Assuming mirrored webcam: User's Left Hand appears on Right side of screen.
    // We will just take up to 2 hands.
    
    // Sort hands by x position. Lower x is user's right (screen left), Higher x is user's left (screen right)
    const sortedHands = [...landmarks].sort((a, b) => a[0].x - b[0].x);

    if (sortedHands.length === 1) {
      // If only one hand, decide based on side
      if (sortedHands[0][0].x < 0.5) rightHand = sortedHands[0];
      else leftHand = sortedHands[0];
    } else if (sortedHands.length === 2) {
      rightHand = sortedHands[0];
      leftHand = sortedHands[1];
    }

    const processHand = (lm: NormalizedLandmark[]) => {
      // Tension: Distance from finger tips to wrist [0]
      // Open hand: tips far from wrist. Closed fist: tips close.
      // Normalize by hand scale (wrist to middle finger base [9])
      const handScale = dist(lm[0], lm[9]);
      
      const thumbDist = dist(lm[4], lm[0]);
      const indexDist = dist(lm[8], lm[0]);
      const middleDist = dist(lm[12], lm[0]);
      const ringDist = dist(lm[16], lm[0]);
      const pinkyDist = dist(lm[20], lm[0]);

      const avgDist = (thumbDist + indexDist + middleDist + ringDist + pinkyDist) / 5;
      
      // Heuristic: Max extension is roughly 2.5 * handScale. Fist is roughly 0.8 * handScale.
      // Tension = 1 (fist) -> 0 (open)
      // If avgDist is high, tension is low.
      const normalizedExtension = (avgDist / handScale);
      // Clamp 0.5 to 2.5 usually
      let tension = 1 - (normalizedExtension - 0.8) / (2.2 - 0.8);
      tension = Math.max(0, Math.min(1, tension));

      // Pinch: thumb tip [4] close to index tip [8]
      const pinchDist = dist(lm[4], lm[8]);
      const isPinching = pinchDist < (0.3 * handScale);

      const center = getPalmCenter(lm);
      
      return { tension, isPinching, center };
    };

    if (rightHand) {
      const h = processHand(rightHand);
      metrics.rightTension = h.tension;
      metrics.isPinchingRight = h.isPinching;
      // Map 0..1 to -1..1 (inverted x for mirror effect)
      metrics.rightHandPos = { x: -(h.center.x - 0.5) * 2 * 2, y: -(h.center.y - 0.5) * 2, z: 0 }; 
    }

    if (leftHand) {
      const h = processHand(leftHand);
      metrics.leftTension = h.tension;
      metrics.isPinchingLeft = h.isPinching;
      metrics.leftHandPos = { x: -(h.center.x - 0.5) * 2 * 2, y: -(h.center.y - 0.5) * 2, z: 0 };
    }

    if (rightHand && leftHand) {
       const rhC = getPalmCenter(rightHand);
       const lhC = getPalmCenter(leftHand);
       const d = Math.sqrt(Math.pow(rhC.x - lhC.x, 2) + Math.pow(rhC.y - lhC.y, 2));
       metrics.handDistance = d; // 0 to ~1
    } else {
      metrics.handDistance = 0.5;
    }

    return metrics;
  }

  stop() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.handLandmarker?.close();
  }
}
