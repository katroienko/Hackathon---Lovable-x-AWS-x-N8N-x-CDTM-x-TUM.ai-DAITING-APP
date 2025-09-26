# 💕 AI-Powered Dating App with Voice Cloning / ИИ-приложение знакомств с клонированием голоса

## Features

- 💕 **User Authentication** - Secure registration and login
- 🔍 **Profile Discovery** - Swipe through potential matches
- 💬 **Real-time Chat** - Text and voice messaging
- 🎤 **Voice Integration** - ElevenLabs text-to-speech and voice messages
- 📱 **Mobile-First Design** - Responsive UI optimized for mobile
- ⚡ **Real-time Updates** - Socket.io for instant messaging

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads

### Voice Technology
- **ElevenLabs** - Text-to-speech and voice cloning
- **Web Audio API** - Voice recording

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- ElevenLabs API key

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd dating-app
   npm install
   ```

2. **Environment Setup:**
   Update the `.env.local` file with your credentials:
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   MONGODB_URI=mongodb://localhost:27017/dating-app
   JWT_SECRET=your_jwt_secret_key_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

3. **Get ElevenLabs API Key:**
   - Sign up at [ElevenLabs](https://elevenlabs.io/)
   - Get your API key from the dashboard
   - Add it to your `.env.local` file

4. **Start MongoDB:**
   - For local MongoDB: `mongod`
   - Or use MongoDB Atlas cloud service

### Running the Application

#### Development (Recommended)
Run both frontend and backend simultaneously:
```bash
npm run dev:all
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8888

#### Separate Processes
Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run dev:server
```

#### Production
```bash
npm run build
npm run start
npm run server  # In separate terminal
```

## Application Structure

```
dating-app/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   │   ├── AuthForm.tsx     # Login/Register form
│   │   ├── Dashboard.tsx    # Main app container
│   │   ├── SwipeCards.tsx   # Profile swiping
│   │   ├── ChatList.tsx     # Matches list
│   │   ├── Chat.tsx         # Chat interface
│   │   └── Profile.tsx      # User profile
│   └── contexts/
│       └── AuthContext.tsx  # Authentication context
├── server/
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── index.js             # Server entry point
└── uploads/                 # File storage
```

## Usage Guide

1. **Register/Login** - Create an account or sign in
2. **Setup Profile** - Add photos, bio, and preferences
3. **Discover** - Swipe through potential matches
4. **Match** - When both users like each other, it's a match!
5. **Chat** - Send text or voice messages to your matches

## Voice Features

- **Text-to-Speech** - Convert messages to natural voice
- **Voice Messages** - Record and send voice notes
- **Voice Preferences** - Choose from multiple voice options
- **Real-time Playback** - Instant voice message playback

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env.local`

2. **ElevenLabs API Error**
   - Verify API key is correct
   - Check API quota/limits

3. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file size limits (5MB max)

### Environment Variables

Make sure all required environment variables are set in `.env.local`:
- `ELEVENLABS_API_KEY` - Your ElevenLabs API key
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
