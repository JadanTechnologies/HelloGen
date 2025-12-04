
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
    let stream: MediaStream | null = null;

    const init = async () => {
      if (!videoRef.current) return;

      // Request Camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
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
        
        // Robust play handling
        try {
          await videoRef.current.play();
        } catch (playError) {
          // If the play request was interrupted (e.g., by unmount or new load), we can safely ignore it if we are unmounted
          if (!isMounted || (playError as Error).name === 'AbortError') {
             return;
          }
          console.warn("Video play failed:", playError);
        }

        if (!isMounted) return;

        // Init Vision
        serviceRef.current = new VisionService(onMetricsUpdate);
        await serviceRef.current.initialize(videoRef.current);
      } catch (err) {
        if (isMounted) {
          console.error("Camera/Vision Init Failed", err);
          // Optional: handle user denial or other errors gracefully
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      serviceRef.current?.stop();
      
      // Stop the stream tracks on cleanup
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      
      if (videoRef.current) {
        // Clearing srcObject acts as a 'load' which can interrupt pending play() promises
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
