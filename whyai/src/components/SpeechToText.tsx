// SpeechToText.tsx
import React, { useState, useEffect, useRef } from 'react';

// Define the SpeechToTextProps interface
interface SpeechToTextProps {
  onResult: (result: string) => void; // Define the type for onResult
  isListening: boolean; // Add isListening prop
}

const SpeechToText: React.FC<SpeechToTextProps> = ({ onResult, isListening }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start recording audio
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      setAudioBlob(blob);
      audioChunksRef.current = []; // Reset for the next recording

      // Optionally, play back the recorded audio
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Send the recorded audio to the Hugging Face API
  const handleUpload = async () => {
    if (audioBlob) {
      try {
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        const result = await query(audioFile);
        onResult(result.text); // Pass the result to the parent component
      } catch (error) {
        console.error('Error uploading the recording:', error);
      }
    }
  };

  // The `query` function for communicating with Hugging Face's API
  const query = async (audioFile: File) => {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        headers: {
          Authorization: 'Bearer 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', // Replace with your actual Hugging Face API token
        },
        method: 'POST',
        body: audioFile, // Directly send the audio file
      }
    );

    if (!response.ok) {
      const errorText = await response.text(); // Get more details about the error
      throw new Error(`Error: ${errorText}`);
    }

    const result = await response.json();
    return result;
  };

  return (
    <div>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {audioBlob && (
        <button onClick={handleUpload}>Upload Recording</button>
      )}
    </div>
  );
};

export default SpeechToText;