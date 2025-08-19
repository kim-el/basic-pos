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

  // Generate realistic waveform data
  const generateWaveformData = () => {
    const points = 300;
    const centerY = 50;
    const waveData = [];
    
    for (let i = 0; i < points; i++) {
      const barIndex = Math.floor((i / points) * bars.length);
      const audioLevel = bars[barIndex] || 8;
      
      // Create more realistic audio waveform pattern
      const frequency1 = Math.sin((i / points) * Math.PI * 8) * 0.8;
      const frequency2 = Math.sin((i / points) * Math.PI * 16) * 0.4;
      const frequency3 = Math.sin((i / points) * Math.PI * 32) * 0.2;
      
      const amplitude = (audioLevel / 80) * centerY * (frequency1 + frequency2 + frequency3);
      const y = centerY + amplitude;
      
      waveData.push({ x: (i / points) * 100, y: Math.max(5, Math.min(95, y)) });
    }
    
    return waveData;
  };

  const waveformData = generateWaveformData();
  
  // Create SVG path from waveform data
  const createPath = () => {
    if (waveformData.length === 0) return '';
    
    let path = `M 0 50`;
    for (let i = 0; i < waveformData.length; i++) {
      const point = waveformData[i];
      path += ` L ${point.x} ${point.y}`;
    }
    path += ` L 100 50`;
    return path;
  };

  return (
    <div className={cn("flex items-center justify-center h-20 sm:h-24 lg:h-28 w-full px-2", className)}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity={isListening ? "0.9" : "0.6"} />
            <stop offset="25%" stopColor="#6366F1" stopOpacity={isListening ? "0.9" : "0.6"} />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity={isListening ? "0.9" : "0.6"} />
            <stop offset="75%" stopColor="#F97316" stopOpacity={isListening ? "0.9" : "0.6"} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={isListening ? "0.9" : "0.6"} />
          </linearGradient>
        </defs>
        <path
          d={createPath()}
          fill="none"
          stroke="url(#waveGradient)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-100 ease-out"
        />
      </svg>
    </div>
  );
}