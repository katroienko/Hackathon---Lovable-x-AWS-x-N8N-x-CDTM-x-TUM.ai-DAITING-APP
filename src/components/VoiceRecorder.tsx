'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceRecorderProps {
  onVoiceCloned?: (voiceData: { voiceId: string; name: string; status: string }) => void;
}

export default function VoiceRecorder({ onVoiceCloned }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [voiceName, setVoiceName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [hasCustomVoice, setHasCustomVoice] = useState(false);
  const [customVoiceInfo, setCustomVoiceInfo] = useState<{ hasCustomVoice: boolean; voiceId?: string; name?: string; status?: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    checkExistingVoice();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [token]);

  const checkExistingVoice = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/voice/my-voice', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasCustomVoice(data.hasCustomVoice);
        setCustomVoiceInfo(data);
      }
    } catch (error) {
      console.error('Failed to check existing voice:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingTime(0);
    setVoiceName('');
  };

  const uploadVoiceClone = async () => {
    if (!audioBlob || !voiceName.trim()) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('voiceSample', audioBlob, 'voice-sample.webm');
      formData.append('name', voiceName);

      const response = await fetch('http://localhost:8888/api/voice/clone-voice', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert('Voice cloned successfully! ✅');
        setHasCustomVoice(true);
        setCustomVoiceInfo({
          hasCustomVoice: true,
          voiceId: result.voiceId,
          name: result.name,
          status: result.status,
        });
        discardRecording();
        onVoiceCloned?.(result);
      } else {
        alert(`Failed to clone voice: ${result.message}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteCustomVoice = async () => {
    if (!confirm('Are you sure you want to delete your custom voice?')) return;

    try {
      const response = await fetch('http://localhost:8888/api/voice/my-voice', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setHasCustomVoice(false);
        setCustomVoiceInfo(null);
        alert('Custom voice deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete voice:', error);
      alert('Failed to delete voice');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (recordingTime < 30) return { text: 'Need at least 30 seconds', color: 'text-red-500' };
    if (recordingTime < 90) return { text: 'Good duration', color: 'text-yellow-500' };
    return { text: 'Perfect duration!', color: 'text-green-500' };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">🎤 Voice Cloning</h3>

      {hasCustomVoice ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-800">✅ Custom Voice Active</h4>
              <p className="text-sm text-green-600">
                Name: {customVoiceInfo?.name} | Status: {customVoiceInfo?.status}
              </p>
            </div>
            <button
              onClick={deleteCustomVoice}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Recording Instructions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Record for 30 seconds to 2 minutes (shorter = smaller file)</li>
              <li>• Speak clearly and naturally</li>
              <li>• Use varied sentences and emotions</li>
              <li>• Record in a quiet environment</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">ElevenLabs Pro Required</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Voice cloning requires ElevenLabs Pro subscription. Free tier only supports basic text-to-speech.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className={`text-4xl font-bold mb-2 ${
              isRecording ? 'text-red-500' : 'text-gray-600'
            }`}>
              {formatTime(recordingTime)}
            </div>

            {isRecording && (
              <div className={`text-sm ${getRecordingStatus().color}`}>
                {getRecordingStatus().text}
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {!isRecording && !audioBlob && (
              <button
                onClick={startRecording}
                className="flex items-center px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Start Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop Recording
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-3">🎵 Recording Preview</h4>
              <audio controls className="w-full mb-3">
                <source src={audioUrl} type="audio/webm" />
              </audio>

              <div className="flex items-center space-x-3 mb-3">
                <label className="text-sm font-medium">Voice Name:</label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g., My Voice"
                  className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="flex justify-center space-x-3">
                <button
                  onClick={discardRecording}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Discard
                </button>
                <button
                  onClick={uploadVoiceClone}
                  disabled={!voiceName.trim() || isUploading || recordingTime < 30}
                  className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Creating Voice...' : 'Create Voice Clone'}
                </button>
              </div>

              {recordingTime < 30 && (
                <p className="text-sm text-red-500 text-center mt-2">
                  Recording too short. Need at least 30 seconds for good quality.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}