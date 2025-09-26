const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test script for voice cloning functionality
// Make sure you have:
// 1. A test audio file (mp3 or wav)
// 2. The server running on port 8888
// 3. Valid ElevenLabs API key in .env.local
// 4. A valid JWT token from login

async function testVoiceCloning() {
  const AUTH_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token from login
  const AUDIO_FILE_PATH = 'test-audio.mp3'; // Replace with your test audio file

  try {
    // Step 1: Clone Voice
    console.log('🎤 Testing voice cloning...');

    if (!fs.existsSync(AUDIO_FILE_PATH)) {
      console.error(`❌ Audio file not found: ${AUDIO_FILE_PATH}`);
      console.log('Please create a test audio file (mp3 or wav) and update AUDIO_FILE_PATH');
      return;
    }

    const form = new FormData();
    form.append('voiceSample', fs.createReadStream(AUDIO_FILE_PATH));
    form.append('name', 'TestVoice');

    const cloneResponse = await fetch('http://localhost:8888/api/voice/clone-voice', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        ...form.getHeaders()
      },
      body: form
    });

    const cloneResult = await cloneResponse.json();

    if (cloneResponse.ok) {
      console.log('✅ Voice cloned successfully!');
      console.log('Voice ID:', cloneResult.voiceId);
      console.log('Name:', cloneResult.name);

      // Step 2: Test Text-to-Speech with cloned voice
      console.log('\n🔊 Testing text-to-speech with cloned voice...');

      const ttsResponse = await fetch('http://localhost:8888/api/voice/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify({
          text: 'Привіт, як справи? Це мій клонований голос!',
          voiceId: cloneResult.voiceId
        })
      });

      const ttsResult = await ttsResponse.json();

      if (ttsResponse.ok) {
        console.log('✅ Text-to-speech successful!');
        console.log('Audio data length:', ttsResult.audioData.length);

        // Save the audio to a file for testing
        const audioBuffer = Buffer.from(ttsResult.audioData.split(',')[1], 'base64');
        fs.writeFileSync('output-cloned-voice.mp3', audioBuffer);
        console.log('💾 Audio saved as output-cloned-voice.mp3');
      } else {
        console.error('❌ Text-to-speech failed:', ttsResult.message);
      }

    } else {
      console.error('❌ Voice cloning failed:', cloneResult.message);
    }

    // Step 3: Check voice info
    console.log('\n📋 Checking user voice info...');

    const voiceInfoResponse = await fetch('http://localhost:8888/api/voice/my-voice', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    const voiceInfo = await voiceInfoResponse.json();
    console.log('Voice Info:', voiceInfo);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for running the test
console.log('🧪 Voice Cloning Test Script');
console.log('============================');
console.log('Before running this test:');
console.log('1. Start the server: npm run dev:server');
console.log('2. Login to get JWT token');
console.log('3. Update AUTH_TOKEN and AUDIO_FILE_PATH in this script');
console.log('4. Make sure you have ElevenLabs API key in .env.local');
console.log('5. Run: node test-voice-cloning.js\n');

// Uncomment the line below to run the test
// testVoiceCloning();