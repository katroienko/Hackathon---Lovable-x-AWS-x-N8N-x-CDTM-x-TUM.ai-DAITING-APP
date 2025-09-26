export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8890',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8890'
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // Users
  PROFILE: '/api/users/profile',
  POTENTIAL_MATCHES: '/api/users/potential-matches',
  MATCHES: '/api/users/matches',
  SWIPE: '/api/users/swipe',
  CLEAR_SWIPE_HISTORY: '/api/users/clear-swipe-history',
  PHOTOS: '/api/users/photos',

  // Chat
  CHAT_HISTORY: '/api/chat',
  SEND_MESSAGE: '/api/chat/send',

  // Voice
  MY_VOICE: '/api/voice/my-voice',
  CLONE_VOICE: '/api/voice/clone-voice',
  TEXT_TO_SPEECH: '/api/voice/text-to-speech',
  USER_VOICE: '/api/voice/user-voice'
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};