import React, { useState, useEffect, useRef } from 'react';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';
import { HandTracker } from './components/HandTracker';
import { GestureMetrics, AppState, ParticleTemplate } from './types';
import { INITIAL_APP_STATE } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [metrics, setMetrics] = useState<GestureMetrics>({
    leftTension: 0,
    rightTension: 0,
    handDistance: 0,
    isPinchingLeft: false,
    isPinchingRight: false,
    leftHandPos: { x: 0, y: 0, z: 0 },
    rightHandPos: { x: 0, y: 0, z: 0 },
    hasHands: false,
  });

  // We use a ref for the gesture metrics to pass to the Scene without triggering React re-renders for every frame
  // However, we also keep a state version 'metrics' for the UI (charts, indicators) which can update less frequently if needed
  const latestMetricsRef = useRef<GestureMetrics>(metrics);

  const handleMetricsUpdate = (newMetrics: GestureMetrics) => {
    latestMetricsRef.current = newMetrics;
    // Debounce state update for UI if needed, or update every frame if performant enough.
    // For 60FPS UI updates, we can just set state.
    setMetrics(newMetrics);
  };

  const handleStateChange = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="relative w-full h-full bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene3D 
          appState={appState} 
          gestureMetricsRef={latestMetricsRef} 
        />
      </div>

      {/* Logic Layer (No UI output, just processing) */}
      <HandTracker onMetricsUpdate={handleMetricsUpdate} />

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay 
          appState={appState} 
          metrics={metrics} 
          onStateChange={handleStateChange} 
        />
      </div>
    </div>
  );
};

export default App;