import React, { useEffect, useRef } from 'react';

interface SpeechToTextProps {
  onResult: (result: string) => void;
  isListening: boolean;
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onResult, isListening }) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start recording audio
  const startRecording = async () => {
    console.log("Attempting to start recording...");
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // Reset chunks
  
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk captured:', event.data);
        } else {
          console.warn("No audio data available in this chunk");
        }
      };
  
      mediaRecorder.onstart = () => {
        console.log("Recording started.");
      };
  
      mediaRecorder.onstop = () => {
        console.log("Stopping recording...");
        if (audioChunksRef.current.length > 0) {
          console.log("Processing audio chunks...");
          processAudioChunks(); // Use the function without passing parameters
        } else {
          console.warn("No audio chunks to process.");
        }
      };
  
      mediaRecorder.start();
  
      // Stop recording after 5 seconds
      setTimeout(() => {
        console.log("Stopping recording...");
        mediaRecorder.stop();
      }, 5000); // Adjust the duration as needed
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };
  

  // Stop recording audio
  const stopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }
    console.log("Recording stopped.");
  };

  // Process accumulated audio chunks
  const processAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) {
      console.log("No audio chunks to process.");
      return;
    }
  
    console.log("Processing audio chunks...");
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    audioChunksRef.current = []; // Reset for the next recording chunk
  
    try {
      const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
      console.log("Sending audio file to API...");
      const result = await query(audioFile);
      console.log("API response:", result);
      onResult(result.text); // Make sure this is executed correctly
    } catch (error) {
      console.error('Error querying the Hugging Face API:', error);
    }
  };
  

  // The `query` function for communicating with Hugging Face's API
  const query = async (audioFile: File) => {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
        {
          headers: {
            Authorization: 'Bearer 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', // Replace with your actual Hugging Face API token
          },
          method: 'POST',
          body: audioFile,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from API:", errorText);
        throw new Error(`Error: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Fetch request failed:", error);
      throw error;
    }
  };

  // Effect to handle start/stop recording based on `isListening` state
  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (processingIntervalRef.current) clearInterval(processingIntervalRef.current);
    };
  }, [isListening]);

  return (
    <div>
      {isListening ? (
        <p>Listening... (Data sent every 10 seconds)</p>
      ) : (
        <p>Not listening. Press 'Start' to begin.</p>
      )}
    </div>
  );
};

export default SpeechToText;
