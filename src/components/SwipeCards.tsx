'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  _id: string;
  name: string;
  age: number;
  bio?: string;
  photos: string[];
}

interface SwipeCardsProps {
  onMatch: (userId: string) => void;
}

export default function SwipeCards({ onMatch }: SwipeCardsProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchPotentialMatches();
  }, [token]);

  const fetchPotentialMatches = async () => {
    try {
      const response = await fetch('http://localhost:8888/api/users/potential-matches', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch potential matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (swiping || currentIndex >= users.length) return;

    setSwiping(true);
    const currentUser = users[currentIndex];

    try {
      const response = await fetch('http://localhost:8888/api/users/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUserId: currentUser._id,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.match) {
          // Show match notification
          setTimeout(() => {
            onMatch(currentUser._id);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Swipe failed:', error);
    }

    setCurrentIndex(prev => prev + 1);
    setSwiping(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (users.length === 0 || currentIndex >= users.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No more profiles</h3>
        <p className="text-gray-600 mb-4">
          Check back later for new people in your area!
        </p>
        <button
          onClick={fetchPotentialMatches}
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600"
        >
          Refresh
        </button>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex-1 relative">
        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
          {/* Photo */}
          <div className="flex-1 relative">
            <Image
              src={currentUser.photos[0] || '/default-avatar.png'}
              alt={currentUser.name}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">
                {currentUser.name}, {currentUser.age}
              </h2>
              {currentUser.bio && (
                <p className="text-sm opacity-90 line-clamp-3">{currentUser.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Match notification overlay */}
        {swiping && (
          <div className="absolute inset-0 bg-pink-500 bg-opacity-90 flex items-center justify-center rounded-xl">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">💕</div>
              <h3 className="text-2xl font-bold">It&apos;s a Match!</h3>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-6 mt-6">
        <button
          onClick={() => handleSwipe('pass')}
          disabled={swiping}
          className="w-16 h-16 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={() => handleSwipe('like')}
          disabled={swiping}
          className="w-16 h-16 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-white disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center mt-4">
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {users.length}
        </div>
      </div>
    </div>
  );
}