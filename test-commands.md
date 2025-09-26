# Voice Cloning Test Commands

## Prerequisites
1. Start the server: `npm run dev:server`
2. Make sure you have ElevenLabs API key in `.env.local`
3. Get JWT token by logging in
4. Have a test audio file ready (mp3 or wav format)

## Step 1: Login to get JWT token
```bash
curl -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"your_password"}'
```

Save the `token` from the response.

## Step 2: Clone Voice
```bash
curl -X POST http://localhost:8888/api/voice/clone-voice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "voiceSample=@path/to/your/audio-file.mp3" \
  -F "name=MyVoice"
```

## Step 3: Test Text-to-Speech with cloned voice
```bash
curl -X POST http://localhost:8888/api/voice/text-to-speech \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"text":"Привіт, як справи?","voiceId":"CLONED_VOICE_ID_FROM_STEP_2"}'
```

## Step 4: Check your voice info
```bash
curl -X GET http://localhost:8888/api/voice/my-voice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Step 5: Get available voices (including your cloned voice)
```bash
curl -X GET http://localhost:8888/api/voice/voices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Step 6: Delete custom voice (if needed)
```bash
curl -X DELETE http://localhost:8888/api/voice/my-voice \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Expected Response Examples

### Voice cloning success:
```json
{
  "message": "Voice cloned successfully",
  "voiceId": "voice_abc123",
  "name": "MyVoice",
  "status": "ready"
}
```

### Text-to-speech success:
```json
{
  "audioData": "data:audio/mpeg;base64,//uQAAAAA...",
  "duration": 1234
}
```

### Voice info:
```json
{
  "hasCustomVoice": true,
  "voiceId": "voice_abc123",
  "name": "MyVoice",
  "status": "ready",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```