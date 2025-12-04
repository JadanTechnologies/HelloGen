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
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Init Vision
        serviceRef.current = new VisionService(onMetricsUpdate);
        await serviceRef.current.initialize(videoRef.current);
      } catch (err) {
        console.error("Camera/Vision Init Failed", err);
        alert("Could not access camera. Please allow camera permissions.");
      }
    };

    init();

    return () => {
      serviceRef.current?.stop();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
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
        autoPlay // Crucial for MediaPipe
      />
    </div>
  );
};
