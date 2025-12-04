
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scene3D } from './components/Scene3D';
import { UIOverlay } from './components/UIOverlay';
import { HandTracker } from './components/HandTracker';
import { InputController } from './components/InputController';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { GestureMetrics, AppState, ParticleTemplate } from './types';
import { INITIAL_APP_STATE } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  // Track if real hands are currently detected
  const [isTrackingHands, setIsTrackingHands] = useState(false);

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

  const latestMetricsRef = useRef<GestureMetrics>(metrics);

  const handleMetricsUpdate = useCallback((newMetrics: GestureMetrics) => {
    latestMetricsRef.current = newMetrics;
    setMetrics(newMetrics);
  }, []);

  // Handler specific for Camera updates
  const handleCameraMetrics = useCallback((m: GestureMetrics) => {
    if (m.hasHands) {
      setIsTrackingHands(true);
      handleMetricsUpdate(m);
    } else {
      setIsTrackingHands(false);
      // We do not update metrics here; we let the InputController take over in the next frame
    }
  }, [handleMetricsUpdate]);

  const handleStateChange = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene3D 
          appState={appState} 
          gestureMetricsRef={latestMetricsRef} 
        />
      </div>

      {/* Input Logic Layers */}
      <HandTracker onMetricsUpdate={handleCameraMetrics} />
      <InputController 
        isActive={!isTrackingHands} 
        onMetricsUpdate={handleMetricsUpdate} 
      />

      {/* UI Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <UIOverlay 
          appState={appState} 
          metrics={metrics} 
          onStateChange={handleStateChange} 
        />
      </div>

      {/* Onboarding Layer */}
      {showOnboarding && (
        <OnboardingOverlay onDismiss={() => setShowOnboarding(false)} />
      )}
    </div>
  );
};

export default App;
