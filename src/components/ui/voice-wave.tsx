'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveProps {
  isListening?: boolean;
  shouldAnalyzeAudio?: boolean;
  className?: string;
}

export function VoiceWave({ isListening = false, shouldAnalyzeAudio = false, className }: VoiceWaveProps) {
  const [bars, setBars] = useState<number[]>([8, 8, 8, 8, 8, 8, 8]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!shouldAnalyzeAudio) {
      // Reset to flat line when not analyzing audio
      setBars([8, 8, 8, 8, 8, 8, 8]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Stop microphone stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      dataArrayRef.current = null;
      return;
    }

    // Get user microphone access only when we should analyze audio
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 256;
        
        microphone.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        const updateWave = () => {
          if (!analyserRef.current || !dataArrayRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          
          // Convert frequency data to bar heights with much higher sensitivity
          const newBars = Array.from({ length: 7 }, (_, i) => {
            const dataIndex = Math.floor((i / 7) * dataArrayRef.current!.length);
            const value = dataArrayRef.current![dataIndex] || 0;
            // Much more sensitive: amplify low values and extend range
            const amplified = Math.pow(value / 255, 0.5) * 255; // Square root for more sensitivity
            return Math.max(8, Math.min(80, (amplified / 255) * 72 + 8));
          });
          
          setBars(newBars);
          animationFrameRef.current = requestAnimationFrame(updateWave);
        };

        updateWave();
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        // Fallback to subtle pulse if mic access denied
        setBars([12, 12, 12, 12, 12, 12, 12]);
      });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clean up on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [shouldAnalyzeAudio]);

  return (
    <div className={cn("flex items-center h-20 sm:h-24 lg:h-28 w-full px-2", className)} style={{ gap: '1px' }}>
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