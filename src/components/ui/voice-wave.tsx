'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveProps {
  isListening?: boolean;
  shouldAnalyzeAudio?: boolean;
  className?: string;
}

export function VoiceWave({ isListening = false, shouldAnalyzeAudio = false, className }: VoiceWaveProps) {
  const [bars, setBars] = useState<number[]>([4, 4, 4, 4, 4, 4, 4]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!shouldAnalyzeAudio) {
      // Reset to flat line when not analyzing audio
      setBars([4, 4, 4, 4, 4, 4, 4]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Get user microphone access only when we should analyze audio
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 32;
        
        microphone.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        const updateWave = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Convert frequency data to bar heights (like iPhone)
          const newBars = Array.from({ length: 7 }, (_, i) => {
            const dataIndex = Math.floor((i / 7) * dataArrayRef.current!.length);
            const value = dataArrayRef.current![dataIndex] || 0;
            // Convert to height (4-48px range for better visibility)
            return Math.max(4, Math.min(48, (value / 255) * 44 + 4));
          });
          
          setBars(newBars);
          animationFrameRef.current = requestAnimationFrame(updateWave);
        };

        updateWave();
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        // Fallback to subtle pulse if mic access denied
        setBars([6, 6, 6, 6, 6, 6, 6]);
      });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldAnalyzeAudio]);

  return (
    <div className={cn("flex items-center h-12 w-full px-2", className)} style={{ gap: '1px' }}>
      {Array.from({ length: 200 }, (_, i) => {
        const barIndex = Math.floor((i / 200) * bars.length);
        const height = bars[barIndex] || 2;
        return (
          <div
            key={i}
            className="bg-black rounded-full transition-all duration-75 ease-out"
            style={{
              width: '0.5px',
              height: `${height}px`,
              opacity: isListening ? 0.8 : 0.4,
              flex: '1 0 0.5px'
            }}
          />
        );
      })}
    </div>
  );
}