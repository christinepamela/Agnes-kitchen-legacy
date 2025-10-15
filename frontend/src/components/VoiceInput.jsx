import React, { useState, useRef } from 'react';

const VoiceInput = ({ onTranscriptComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // For now, we'll just show a placeholder
        // In production, you'd send this to a speech-to-text API
        setTranscript('Voice recording saved. Transcription coming soon!');
        onTranscriptComplete('Voice recording saved. Transcription coming soon!');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="voice-input">
      <div className="voice-controls">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="btn btn-primary"
        >
          🎤 Start Recording
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="btn btn-secondary"
        >
          ⏹ Stop Recording
        </button>
      </div>
      {transcript && (
        <div className="transcript-box">
          <p><strong>Transcript:</strong></p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;