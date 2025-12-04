import React, { useEffect, useRef } from 'react';
import { ThreeService } from '../services/threeService';
import { AppState, GestureMetrics } from '../types';

interface Props {
  appState: AppState;
  gestureMetricsRef: React.MutableRefObject<GestureMetrics>;
}

export const Scene3D: React.FC<Props> = ({ appState, gestureMetricsRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const threeServiceRef = useRef<ThreeService | null>(null);
  
  // Keep track of latest app state for the animation loop
  const appStateRef = useRef(appState);

  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Init Three.js
    threeServiceRef.current = new ThreeService(
      containerRef.current, 
      appStateRef.current.particleCount
    );

    // Animation Loop
    let animationId: number;
    const animate = (time: number) => {
      threeServiceRef.current?.update(gestureMetricsRef.current, appStateRef.current, time);
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      threeServiceRef.current?.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount. AppState updates are handled via the ref.

  return <div ref={containerRef} className="w-full h-full" />;
};