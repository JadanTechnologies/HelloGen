import React, { useEffect, useRef } from 'react';
import { VisionService } from '../services/visionService';
import { GestureMetrics } from '../types';

interface Props {
  onMetricsUpdate: (metrics: GestureMetrics) => void;
}

export const HandTracker: React.FC<Props> = ({ onMetricsUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const serviceRef = useRef<VisionService | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      if (!videoRef.current) return;

      // Request Camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640,
            height: 480,
            frameRate: { ideal: 30 }
          } 
        });

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        
        // Wait for play to ensure data flow
        await videoRef.current.play();

        if (!isMounted) return;

        // Init Vision
        serviceRef.current = new VisionService(onMetricsUpdate);
        await serviceRef.current.initialize(videoRef.current);
      } catch (err) {
        if (isMounted) {
          console.error("Camera/Vision Init Failed", err);
          // Only alert if we really failed and are still mounted
          if ((err as Error).name !== 'AbortError') {
             // Optional: handle user denial or other errors gracefully
             console.log("Could not access camera or interrupted.");
          }
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      serviceRef.current?.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [onMetricsUpdate]);

  return (
    <div className="hidden">
      <video 
        ref={videoRef} 
        className="w-px h-px opacity-0" 
        playsInline 
        muted 
        autoPlay 
      />
    </div>
  );
};