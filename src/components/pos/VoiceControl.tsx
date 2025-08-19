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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

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
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Volume2 className="h-5 w-5" />
          Voice Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Top Row: Wave and Button */}
        <div className="flex items-center gap-2">
          {/* Voice Wave Visualization */}
          <div className="flex-1 min-w-0">
            <VoiceWave isListening={isListening} shouldAnalyzeAudio={isListening} />
          </div>
          
          {/* Voice Activation Button */}
          <Button
            onClick={toggleListening}
            className={`rounded-lg w-40 h-40 text-xl font-bold border-4 ${isListening ? 'bg-red-500 hover:bg-red-600 border-red-600' : 'bg-blue-500 hover:bg-blue-600 border-blue-600'} shadow-xl`}
            variant="default"
          >
            <div className="flex flex-col items-center justify-center">
              {isListening ? (
                <>
                  <MicOff className="h-12 w-12 mb-2" />
                  <span>STOP</span>
                </>
              ) : (
                <>
                  <Mic className="h-12 w-12 mb-2" />
                  <span>START</span>
                </>
              )}
            </div>
          </Button>
        </div>
        
        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge 
            variant={isListening ? "default" : "secondary"}
            className="text-xs"
          >
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>
        
        {/* Last Command Display */}
        {lastCommand && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Last command:</p>
            <p className="text-sm font-medium bg-gray-100 rounded px-2 py-1">
              "{lastCommand}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}