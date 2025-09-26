'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    photos: string[];
  };
  receiver: {
    _id: string;
    name: string;
    photos: string[];
  };
  content: string;
  messageType: 'text' | 'voice';
  voiceData?: {
    audioUrl: string;
    duration: number;
    transcript?: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface ChatProps {
  userId: string;
  onBack: () => void;
}

export default function Chat({ userId, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<{ _id: string; name: string; photos: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [userVoiceId, setUserVoiceId] = useState<string>('pNInz6obpgDQGcFmaJgB');
  const [otherUserVoiceId, setOtherUserVoiceId] = useState<string>('pNInz6obpgDQGcFmaJgB');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { user, token } = useAuth();

  useEffect(() => {
    fetchMessages();
    fetchUserProfile();
    fetchUserVoice();
    fetchOtherUserVoice();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8888/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const matchUser = data.matches?.find((match: { _id: string; name: string; photos: string[] }) => match._id === userId);
        setOtherUser(matchUser);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchUserVoice = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/voice/my-voice', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.hasCustomVoice && data.status === 'ready') {
          setUserVoiceId(data.voiceId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user voice:', error);
    }
  };

  const fetchOtherUserVoice = async () => {
    try {
      const response = await fetch(`http://localhost:8888/api/voice/user-voice/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.hasCustomVoice && data.status === 'ready') {
          setOtherUserVoiceId(data.voiceId);
        }
      }
    } catch (error) {
      console.error('Failed to fetch other user voice:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8888/api/chat/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: 'text' | 'voice' = 'text', voiceData?: { audioUrl: string; duration: number; transcript?: string }) => {
    if (!content.trim() && messageType === 'text') return;

    setSending(true);
    try {
      const response = await fetch('http://localhost:8888/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: userId,
          content,
          messageType,
          voiceData,
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

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
        await handleAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleAudioMessage = async (_audioBlob: Blob) => {
    try {
      // Convert audio to text using speech recognition
      const transcript = 'Voice message'; // Placeholder - implement speech-to-text if needed

      // Convert to text-to-speech using ElevenLabs
      const response = await fetch('http://localhost:8888/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: transcript,
          voiceId: userVoiceId
        }),
      });

      if (response.ok) {
        const voiceData = await response.json();
        await sendMessage(transcript, 'voice', {
          audioUrl: voiceData.audioData,
          duration: recordingTime,
          transcript
        });
      }
    } catch (error) {
      console.error('Failed to process voice message:', error);
    }
  };

  const playVoiceMessage = (audioData: string) => {
    const audio = new Audio(audioData);
    audio.play();
  };

  const playTextWithVoice = async (text: string, isOwnMessage: boolean) => {
    try {
      const voiceId = isOwnMessage ? userVoiceId : otherUserVoiceId;

      const response = await fetch('http://localhost:8888/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId
        }),
      });

      if (response.ok) {
        const voiceData = await response.json();
        const audio = new Audio(voiceData.audioData);
        audio.play();
      } else {
        console.error('Failed to generate speech');
      }
    } catch (error) {
      console.error('Failed to play text with voice:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mr-3"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        {otherUser && (
          <div className="flex items-center">
            <Image
              src={otherUser.photos?.[0] || '/default-avatar.png'}
              alt={otherUser.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <h2 className="text-lg font-semibold">{otherUser.name}</h2>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender._id === user?.id;

          return (
            <div
              key={message._id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.messageType === 'voice' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => playVoiceMessage(message.voiceData!.audioUrl)}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">
                        {Math.floor(message.voiceData!.duration / 60)}:
                        {(message.voiceData!.duration % 60).toString().padStart(2, '0')}
                      </span>
                    </button>
                    {message.voiceData?.transcript && (
                      <p className="text-xs opacity-75">{message.voiceData.transcript}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="flex-1">{message.content}</p>
                    <button
                      onClick={() => playTextWithVoice(message.content, isOwnMessage)}
                      className={`ml-2 p-1 rounded-full hover:bg-opacity-20 hover:bg-white ${
                        isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                      }`}
                      title={`Play with ${isOwnMessage ? 'your' : message.sender.name + "'s"} voice`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816l-4.5-3.5A1 1 0 013 12.5v-5a1 1 0 01.383-.924l4.5-3.5zm5.617 4.924A1 1 0 1116.383 9.076 4.001 4.001 0 0118 12a4.001 4.001 0 01-1.617 2.924A1 1 0 0114.383 13.076 2.001 2.001 0 0016 12a2.001 2.001 0 00-1.617-1.924z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-pink-100' : 'text-gray-500'}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(newMessage)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={sending || isRecording}
          />

          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`p-2 rounded-full ${
              isRecording
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={sending}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>

          <button
            onClick={() => sendMessage(newMessage)}
            disabled={sending || !newMessage.trim()}
            className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>

        {isRecording && (
          <div className="mt-2 flex items-center justify-center text-red-500">
            <div className="animate-pulse flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm">Recording... {recordingTime}s</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}