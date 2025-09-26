// Test script to debug ElevenLabs API
const FormData = require('form-data');
const fs = require('fs');

async function testElevenLabsAPI() {
  const ELEVENLABS_API_KEY = 'sk_0a708403cd51b255b857e964b73da3607a042faea7802e95';

  // Create a simple test WAV file (just for testing API format)
  const testAudioPath = 'test-audio.wav';

  // Create a minimal WAV file for testing
  const wavHeader = Buffer.alloc(44);
  const wavData = Buffer.alloc(1000); // 1KB of silence

  // Write WAV header
  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + wavData.length, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);  // PCM
  wavHeader.writeUInt16LE(1, 22);  // Mono
  wavHeader.writeUInt32LE(22050, 24); // Sample rate
  wavHeader.writeUInt32LE(44100, 28); // Byte rate
  wavHeader.writeUInt16LE(2, 32);  // Block align
  wavHeader.writeUInt16LE(16, 34); // Bits per sample
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(wavData.length, 40);

  fs.writeFileSync(testAudioPath, Buffer.concat([wavHeader, wavData]));

  console.log('✅ Created test WAV file');

  try {
    const form = new FormData();
    form.append('name', 'TestVoice');
    form.append('files[]', fs.createReadStream(testAudioPath), {
      filename: 'test-audio.wav',
      contentType: 'audio/wav'
    });
    form.append('description', 'Test voice clone');
    form.append('remove_background_noise', 'true');

    console.log('🔄 Making request to ElevenLabs API...');
    console.log('Form headers:', form.getHeaders());

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        ...form.getHeaders()
      },
      body: form
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📊 Response body:', responseText);

    if (response.ok) {
      console.log('✅ Success!');
      const data = JSON.parse(responseText);
      console.log('Voice ID:', data.voice_id);
    } else {
      console.log('❌ Failed');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    // Cleanup
    try {
      fs.unlinkSync(testAudioPath);
      console.log('🧹 Cleaned up test file');
    } catch (err) {
      console.warn('Failed to cleanup:', err.message);
    }
  }
}

testElevenLabsAPI();