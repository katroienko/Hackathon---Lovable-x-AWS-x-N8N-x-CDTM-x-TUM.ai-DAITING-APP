'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SwipeCards from './SwipeCards';
import ChatList from './ChatList';
import Profile from './Profile';
import Chat from './Chat';

type Tab = 'discover' | 'matches' | 'chat' | 'profile';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const { logout } = useAuth();

  const handleStartChat = (userId: string) => {
    setActiveChatUserId(userId);
    setActiveTab('chat');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'discover':
        return <SwipeCards onMatch={handleStartChat} />;
      case 'matches':
        return <ChatList onSelectChat={handleStartChat} />;
      case 'chat':
        return activeChatUserId ? (
          <Chat userId={activeChatUserId} onBack={() => setActiveTab('matches')} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a match to start chatting</p>
          </div>
        );
      case 'profile':
        return <Profile />;
      default:
        return <SwipeCards onMatch={handleStartChat} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">💕 Dating App</h1>
        <button
          onClick={logout}
          className="text-white hover:text-pink-200 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('discover')}
            className={`p-3 rounded-full ${
              activeTab === 'discover'
                ? 'bg-pink-100 text-pink-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('matches')}
            className={`p-3 rounded-full ${
              activeTab === 'matches'
                ? 'bg-pink-100 text-pink-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`p-3 rounded-full ${
              activeTab === 'chat'
                ? 'bg-pink-100 text-pink-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`p-3 rounded-full ${
              activeTab === 'profile'
                ? 'bg-pink-100 text-pink-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}