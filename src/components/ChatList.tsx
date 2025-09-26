'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

interface Match {
  _id: string;
  name: string;
  photos: string[];
}

interface ChatListProps {
  onSelectChat: (userId: string) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, [token]);

  const fetchMatches = async () => {
    try {
      console.log('🔍 Fetching matches with token:', token ? 'present' : 'missing');
      const response = await fetch(buildApiUrl(API_ENDPOINTS.MATCHES), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Matches API response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Matches data received:', data);
        console.log('📊 Number of matches:', data.length);
        setMatches(data);
      } else {
        console.error('❌ Matches API error:', response.status, await response.text());
      }
    } catch (error) {
      console.error('💥 Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
        <div className="text-6xl mb-4">💔</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
        <p className="text-gray-600">
          Start swiping to find your perfect match!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Matches</h2>

      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match._id}
            onClick={() => onSelectChat(match._id)}
            className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
          >
            <Image
              src={match.photos[0] || '/default-avatar.png'}
              alt={match.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{match.name}</h3>
              <p className="text-sm text-gray-600">Tap to start chatting</p>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}