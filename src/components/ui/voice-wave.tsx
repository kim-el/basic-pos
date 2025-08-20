'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceWaveProps {
  isListening?: boolean;
  shouldAnalyzeAudio?: boolean;
  className?: string;
}

export function VoiceWave({ isListening = false, shouldAnalyzeAudio = false, className }: VoiceWaveProps) {
  const [bars, setBars] = useState<number[]>([20, 35, 50, 70, 85, 70, 50, 35, 20, 40, 60, 45, 30, 55, 75]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!shouldAnalyzeAudio) {
      // Reset to gentle idle pattern when not analyzing audio
      setBars([20, 35, 50, 70, 85, 70, 50, 35, 20, 40, 60, 45, 30, 55, 75]);
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
          
          // Convert frequency data to bar heights with enhanced sensitivity
          const newBars = Array.from({ length: 15 }, (_, i) => {
            const dataIndex = Math.floor((i / 15) * dataArrayRef.current!.length);
            const value = dataArrayRef.current![dataIndex] || 0;
            // Enhanced sensitivity with better range
            const amplified = Math.pow(value / 255, 0.3) * 255;
            return Math.max(15, Math.min(95, (amplified / 255) * 80 + 15));
          });
          
          setBars(newBars);
          animationFrameRef.current = requestAnimationFrame(updateWave);
        };

        updateWave();
      })
      .catch(err => {
        console.error('Microphone access denied:', err);
        // Fallback to subtle pulse if mic access denied
        setBars([25, 40, 55, 75, 90, 75, 55, 40, 25, 45, 65, 50, 35, 60, 80]);
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

  // Animate bars when listening without microphone access
  useEffect(() => {
    if (!isListening || shouldAnalyzeAudio) return;
    
    const animateInterval = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        // Create wave-like pattern with randomness
        const baseHeight = 30 + Math.sin((Date.now() / 300) + (i * 0.5)) * 20;
        const randomVariation = Math.random() * 30;
        return Math.max(15, Math.min(95, baseHeight + randomVariation));
      }));
    }, 100);
    
    return () => clearInterval(animateInterval);
  }, [isListening, shouldAnalyzeAudio]);

  return (
    <div className={cn("flex items-center justify-center h-16 w-full px-2", className)}>
      <div className="flex items-end justify-center space-x-1 h-full w-full max-w-48">
        {bars.map((height, index) => {
          const isCenter = Math.abs(index - bars.length / 2) < 2;
          return (
            <div
              key={index}
              className={`bg-gradient-to-t transition-all duration-75 ease-out rounded-t-lg ${
                isListening 
                  ? 'from-blue-600 via-purple-500 to-blue-400 shadow-sm shadow-blue-400/30' 
                  : 'from-gray-500 to-gray-400'
              } ${isCenter ? 'opacity-100' : 'opacity-80'}`}
              style={{
                height: `${height}%`,
                width: index % 3 === 0 ? '4px' : index % 2 === 0 ? '3px' : '2px',
                transform: isListening ? `scaleY(${0.8 + (height / 200)})` : 'scaleY(0.6)',
                filter: isListening ? `blur(${index % 4 === 0 ? '0px' : '0.5px'})` : 'none',
                animationDelay: `${index * 50}ms`
              }}
            />
          );
        })}
      </div>
    </div>
  );
}