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
          // Clean up immediately if unmounted during request
          if (stream) stream.getTracks().forEach(t => t.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        
        // Robust play handling
        try {
          await videoRef.current.play();
        } catch (playError) {
          const err = playError as Error;
          // Ignore interruption errors if we are unmounted or if it's an AbortError
          const isInterruption = err.name === 'AbortError' || err.message.includes('interrupted');
          
          if (!isMounted || isInterruption) {
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
          // Suppress known "aborted" errors which happen during Strict Mode double-mount
          const msg = (err instanceof Error) ? err.message : String(err);
          const isNetworkAbort = msg.includes('aborted') || msg.includes('Network error');
          
          if (!isNetworkAbort) {
            console.error("Camera/Vision Init Failed", err);
          }
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
        // Pause before clearing to prevent pending play promise rejections
        videoRef.current.pause();
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