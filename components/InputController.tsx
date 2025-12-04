import React, { useEffect, useRef } from 'react';
import { GestureMetrics } from '../types';

interface Props {
  onMetricsUpdate: (metrics: GestureMetrics) => void;
  isActive: boolean;
}

export const InputController: React.FC<Props> = ({ onMetricsUpdate, isActive }) => {
  // Store virtual state to maintain continuity
  const state = useRef({
    leftPos: { x: -0.3, y: 0, z: 0 },
    rightPos: { x: 0.3, y: 0, z: 0 },
    distance: 0.5,
    keys: {
      w: false, a: false, s: false, d: false,
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      Space: false
    }
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // WASD
      if (['w','a','s','d'].includes(e.key.toLowerCase())) {
        state.current.keys[e.key.toLowerCase() as 'w'|'a'|'s'|'d'] = true;
      }
      // Arrows
      if (state.current.keys.hasOwnProperty(e.key)) {
         // @ts-ignore - dynamic key access for arrows
         state.current.keys[e.key] = true;
      }
      if (e.code === 'Space') {
        state.current.keys.Space = true;
        // Prevent scrolling with space
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (['w','a','s','d'].includes(e.key.toLowerCase())) {
        state.current.keys[e.key.toLowerCase() as 'w'|'a'|'s'|'d'] = false;
      }
      if (state.current.keys.hasOwnProperty(e.key)) {
         // @ts-ignore
         state.current.keys[e.key] = false;
      }
      if (e.code === 'Space') state.current.keys.Space = false;
    };

    const onWheel = (e: WheelEvent) => {
      // Scroll Up (negative delta) -> Increase distance (Expand)
      // Scroll Down (positive delta) -> Decrease distance (Contract)
      const sensitivity = 0.001;
      state.current.distance -= e.deltaY * sensitivity;
      state.current.distance = Math.max(0, Math.min(1, state.current.distance));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    let frameId: number;
    
    const loop = () => {
      if (isActive) {
        const s = state.current;
        const speed = 0.02;

        // WASD -> Move Left Hand
        if (s.keys.w) s.leftPos.y += speed;
        if (s.keys.s) s.leftPos.y -= speed;
        if (s.keys.a) s.leftPos.x -= speed;
        if (s.keys.d) s.leftPos.x += speed;

        // Arrows -> Move Right Hand
        if (s.keys.ArrowUp) s.rightPos.y += speed;
        if (s.keys.ArrowDown) s.rightPos.y -= speed;
        if (s.keys.ArrowLeft) s.rightPos.x -= speed;
        if (s.keys.ArrowRight) s.rightPos.x += speed;

        // Clamp positions to reasonable screen space (-1 to 1)
        const clamp = (val: number) => Math.max(-1.5, Math.min(1.5, val));
        s.leftPos.x = clamp(s.leftPos.x);
        s.leftPos.y = clamp(s.leftPos.y);
        s.rightPos.x = clamp(s.rightPos.x);
        s.rightPos.y = clamp(s.rightPos.y);

        // Calculate pinch/tension from Spacebar
        const tension = s.keys.Space ? 1.0 : 0.0;
        
        // Construct metrics
        const metrics: GestureMetrics = {
          leftTension: tension,
          rightTension: tension,
          handDistance: s.distance,
          isPinchingLeft: s.keys.Space,
          isPinchingRight: s.keys.Space,
          leftHandPos: { ...s.leftPos },
          rightHandPos: { ...s.rightPos },
          hasHands: true // Mock hands so the scene renders cursors
        };
        
        onMetricsUpdate(metrics);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isActive, onMetricsUpdate]);

  return null;
};
