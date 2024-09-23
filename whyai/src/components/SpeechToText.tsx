import React, { useEffect, useState } from 'react';

interface SpeechToTextProps {
  onResult: (result: string) => void;
  isListening: boolean;
}

export const SpeechToText: React.FC<SpeechToTextProps> = ({ onResult, isListening }) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          onResult(result[0].transcript);
        }
      };

      setRecognition(recognition);
    }
  }, [onResult]);

  useEffect(() => {
    if (recognition) {
      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }
  }, [isListening, recognition]);

  return null;
};