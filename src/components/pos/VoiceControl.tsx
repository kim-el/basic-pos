'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceWave } from '@/components/ui/voice-wave';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceControlProps {
  onVoiceCommand?: (command: string) => void;
  className?: string;
}

export function VoiceControl({ onVoiceCommand, className }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        onVoiceCommand?.(command);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [onVoiceCommand]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 h-48 sm:h-52 lg:h-56 flex flex-col border border-gray-700 ${className}`}>
      <div className="mb-3 sm:mb-4">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-white">
          <Volume2 className="h-5 w-5 text-white" />
          Voice Control
        </h2>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        {/* Wave and Button Row */}
        <div className="flex items-center gap-4">
          {/* Voice Wave Visualization */}
          <div className="flex-1 min-w-0">
            <VoiceWave isListening={isListening} shouldAnalyzeAudio={isListening} />
          </div>
          
          {/* Voice Activation Button */}
          <Button
            onClick={toggleListening}
            className={`rounded-lg w-20 h-20 sm:w-24 sm:h-24 text-sm sm:text-base font-bold border-2 ${isListening ? 'bg-red-600 hover:bg-red-700 border-red-500' : 'bg-blue-600 hover:bg-blue-700 border-blue-500'} shadow-lg flex-shrink-0`}
            variant="default"
          >
            <div className="flex flex-col items-center justify-center">
              {isListening ? (
                <>
                  <MicOff className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  <span className="text-xs sm:text-sm">STOP</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                  <span className="text-xs sm:text-sm">START</span>
                </>
              )}
            </div>
          </Button>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={isListening ? "default" : "secondary"}
            className="text-xs sm:text-sm"
          >
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
        
        {/* Last Command Display - Fixed height area */}
        <div className="min-h-[2rem] flex items-center justify-center">
          {lastCommand && (
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Last command:</p>
              <p className="text-xs sm:text-sm font-medium bg-gray-700 text-gray-200 rounded px-2 py-1 break-words">
                &ldquo;{lastCommand}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}