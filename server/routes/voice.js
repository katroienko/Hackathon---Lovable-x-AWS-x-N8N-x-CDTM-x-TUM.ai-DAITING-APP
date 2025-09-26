const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  dest: 'uploads/voice-samples/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'audio/x-wav',
      'audio/webm',  // WebM format from browser recording
      'audio/webm;codecs=opus'  // WebM with Opus codec
    ];

    const allowedExtensions = /\.(mp3|wav|webm)$/i;

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
      console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`);
      cb(null, true);
    } else {
      console.log(`❌ File rejected: ${file.originalname} (${file.mimetype})`);
      cb(new Error('Only MP3, WAV, and WebM audio files are allowed'));
    }
  }
});

let elevenlabs = null;

// Initialize ElevenLabs client only if API key is provided
if (process.env.ELEVENLABS_API_KEY) {
  try {
    const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
    elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });
    console.log('ElevenLabs client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize ElevenLabs client:', error.message);
  }
} else {
  console.warn('ELEVENLABS_API_KEY not found. Voice features will be disabled.');
}

// Voice Cloning - Upload audio sample and create custom voice
router.post('/clone-voice', auth, upload.single('voiceSample'), async (req, res) => {
  try {
    console.log('=== Voice Cloning Request Started ===');
    console.log('User:', req.user?.id);
    console.log('File uploaded:', req.file ? 'Yes' : 'No');
    console.log('Body:', req.body);

    if (!elevenlabs) {
      console.log('ERROR: ElevenLabs client not initialized');
      return res.status(503).json({
        message: 'Voice service unavailable. Please configure ELEVENLABS_API_KEY.'
      });
    }

    if (!req.file) {
      console.log('ERROR: No file uploaded');
      return res.status(400).json({ message: 'Voice sample file is required' });
    }

    const { name } = req.body;
    if (!name) {
      console.log('ERROR: No voice name provided');
      return res.status(400).json({ message: 'Voice name is required' });
    }

    // Read and convert the uploaded file
    console.log('Reading file:', req.file.path);
    console.log('File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    let audioBuffer;
    const outputPath = req.file.path + '.wav';

    if (req.file.mimetype === 'audio/webm') {
      // Convert WebM to WAV
      console.log('Converting WebM to WAV...');
      const ffmpeg = require('fluent-ffmpeg');
      const ffmpegStatic = require('@ffmpeg-installer/ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegStatic.path);

      await new Promise((resolve, reject) => {
        ffmpeg(req.file.path)
          .toFormat('wav')
          .audioFrequency(16000)  // 16kHz (even lower to reduce file size)
          .audioChannels(1)       // Mono
          .audioCodec('pcm_s16le') // PCM 16-bit little endian
          .outputOptions([
            '-acodec pcm_s16le',   // 16-bit PCM
            '-ar 16000',           // Lower sample rate for smaller files
            '-ac 1',               // Force mono
            '-af', 'volume=2.0',   // Boost volume for better quality
            '-ac 1',               // Mono
            '-t 120'               // Limit to 120 seconds (2 minutes) max
          ])
          .on('end', () => {
            console.log('Audio conversion completed with proper ElevenLabs format');
            resolve(null);
          })
          .on('error', (err) => {
            console.error('Audio conversion error:', err);
            reject(err);
          })
          .save(outputPath);
      });

      audioBuffer = fs.readFileSync(outputPath);
      console.log('Converted audio buffer size:', audioBuffer.length);
    } else {
      // Use original file if it's already in supported format
      audioBuffer = fs.readFileSync(req.file.path);
      console.log('Audio buffer size:', audioBuffer.length);
    }

    console.log(`Creating voice clone "${name}" for user ${req.user.id}`);

    // Create voice clone using direct HTTP API call
    const FormData = require('form-data');

    const form = new FormData();
    form.append('name', `${name}_${req.user.id}`);

    // Use the converted WAV file path if available, otherwise original file
    const audioFilePath = req.file.mimetype === 'audio/webm' ? outputPath : req.file.path;

    // Check file size (max 10MB to be safe)
    const stats = fs.statSync(audioFilePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`File size: ${fileSizeMB.toFixed(2)}MB`);

    if (fileSizeMB > 10) {
      throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB. Maximum allowed: 10MB`);
    }

    form.append('files', fs.createReadStream(audioFilePath), {
      filename: 'voice-sample.wav',
      contentType: 'audio/wav'
    });
    form.append('description', `Custom voice for ${req.user.name}`);
    form.append('remove_background_noise', 'true');

    console.log('Using audio file:', audioFilePath);
    console.log('File exists:', fs.existsSync(audioFilePath));
    console.log('File size:', fs.statSync(audioFilePath).size);

    console.log('Making HTTP request to ElevenLabs API...');
    console.log('Form fields:');
    console.log('- name:', `${name}_${req.user.id}`);
    console.log('- description:', `Custom voice for ${req.user.name}`);
    console.log('- remove_background_noise:', 'true');
    console.log('- files: ReadStream from', audioFilePath);

    const axios = require('axios');

    let clonedVoice;
    try {
      const response = await axios.post('https://api.elevenlabs.io/v1/voices/add', form, {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          ...form.getHeaders()
        },
        timeout: 60000 // 60 second timeout
      });

      console.log('✅ ElevenLabs API Success!');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      clonedVoice = response.data;
    } catch (axiosError) {
      console.error('❌ Axios Error Details:');
      console.error('- Error message:', axiosError.message);

      if (axiosError.response) {
        console.error('- Status:', axiosError.response.status);
        console.error('- Status text:', axiosError.response.statusText);
        console.error('- Response data:', axiosError.response.data);
        console.error('- Response headers:', axiosError.response.headers);
        throw new Error(`ElevenLabs API error: ${axiosError.response.status} ${JSON.stringify(axiosError.response.data)}`);
      } else if (axiosError.request) {
        console.error('- No response received:', axiosError.request);
        throw new Error('No response from ElevenLabs API');
      } else {
        console.error('- Request setup error:', axiosError.message);
        throw new Error(`Request error: ${axiosError.message}`);
      }
    }

    console.log('Voice clone created successfully:', response.data.voice_id);

    // Update user with custom voice info
    await User.findByIdAndUpdate(req.user.id, {
      customVoice: {
        elevenLabsVoiceId: response.data.voice_id,
        name: name,
        status: 'ready',
        audioSamplePath: req.file.path,
        createdAt: new Date()
      }
    });

    // Clean up uploaded files after processing
    try {
      fs.unlinkSync(req.file.path);
      if (req.file.mimetype === 'audio/webm') {
        fs.unlinkSync(outputPath);
      }
    } catch (err) {
      console.warn('Failed to clean up audio files:', err.message);
    }

    res.json({
      message: 'Voice cloned successfully',
      voiceId: clonedVoice.voice_id,
      name: name,
      status: 'ready',
      requiresVerification: clonedVoice.requires_verification || false
    });
  } catch (error) {
    console.error('=== Voice Cloning Error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);

    // Clean up files on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
        if (req.file.mimetype === 'audio/webm') {
          const outputPath = req.file.path + '.wav';
          fs.unlinkSync(outputPath);
        }
      } catch (err) {
        console.warn('Failed to clean up audio files on error:', err.message);
      }
    }

    // Update user status to failed
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        'customVoice.status': 'failed',
        'customVoice.error': error.message
      }).catch(err => console.error('Failed to update user voice status:', err));
    }

    res.status(500).json({ message: 'Failed to clone voice', error: error.message });
  }
});

// Get user's custom voice info
router.get('/my-voice', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('customVoice');

    if (!user.customVoice || !user.customVoice.elevenLabsVoiceId) {
      return res.json({ hasCustomVoice: false });
    }

    res.json({
      hasCustomVoice: true,
      voiceId: user.customVoice.elevenLabsVoiceId,
      name: user.customVoice.name,
      status: user.customVoice.status,
      createdAt: user.customVoice.createdAt,
      error: user.customVoice.error
    });
  } catch (error) {
    console.error('Get custom voice error:', error);
    res.status(500).json({ message: 'Failed to get custom voice info' });
  }
});

// Get another user's custom voice info
router.get('/user-voice/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('customVoice');

    if (!user || !user.customVoice || !user.customVoice.elevenLabsVoiceId) {
      return res.json({ hasCustomVoice: false });
    }

    res.json({
      hasCustomVoice: true,
      voiceId: user.customVoice.elevenLabsVoiceId,
      name: user.customVoice.name,
      status: user.customVoice.status,
      createdAt: user.customVoice.createdAt
    });
  } catch (error) {
    console.error('Get user voice error:', error);
    res.status(500).json({ message: 'Failed to get user voice info' });
  }
});

// Delete custom voice
router.delete('/my-voice', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.customVoice || !user.customVoice.elevenLabsVoiceId) {
      return res.status(404).json({ message: 'No custom voice found' });
    }

    // Delete from ElevenLabs if available
    if (elevenlabs) {
      try {
        await elevenlabs.voices.delete(user.customVoice.elevenLabsVoiceId);
      } catch (error) {
        console.warn('Failed to delete voice from ElevenLabs:', error.message);
      }
    }

    // Remove from user
    await User.findByIdAndUpdate(req.user.id, {
      $unset: { customVoice: 1 }
    });

    res.json({ message: 'Custom voice deleted successfully' });
  } catch (error) {
    console.error('Delete custom voice error:', error);
    res.status(500).json({ message: 'Failed to delete custom voice' });
  }
});

// Text to Speech
router.post('/text-to-speech', auth, async (req, res) => {
  try {
    if (!elevenlabs) {
      return res.status(503).json({
        message: 'Voice service unavailable. Please configure ELEVENLABS_API_KEY.'
      });
    }

    const { text, voiceId = 'pNInz6obpgDQGcFmaJgB' } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const audio = await elevenlabs.textToSpeech.convert(voiceId, {
      text,
      modelId: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75
      }
    });

    const chunks = [];
    for await (const chunk of audio) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');

    res.json({
      audioData: `data:audio/mpeg;base64,${audioBase64}`,
      duration: audioBuffer.length
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    res.status(500).json({ message: 'Failed to generate speech' });
  }
});

// Get available voices
router.get('/voices', auth, async (req, res) => {
  try {
    if (!elevenlabs) {
      // Return default voices when ElevenLabs is not available
      return res.json({
        voices: [
          { id: 'alloy', name: 'Alloy', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' },
          { id: 'echo', name: 'Echo', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' },
          { id: 'fable', name: 'Fable', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' },
          { id: 'onyx', name: 'Onyx', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' },
          { id: 'nova', name: 'Nova', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' },
          { id: 'shimmer', name: 'Shimmer', category: 'default', description: 'Default voice', gender: 'neutral', age: 'adult' }
        ]
      });
    }

    const voices = await elevenlabs.voices.getAll();

    const voiceList = voices.map(voice => ({
      id: voice.voiceId,
      name: voice.name,
      category: voice.category,
      description: voice.description || '',
      gender: voice.labels?.gender || 'unknown',
      age: voice.labels?.age || 'unknown'
    }));

    res.json({ voices: voiceList });
  } catch (error) {
    console.error('Get voices error:', error);
    res.status(500).json({ message: 'Failed to fetch voices' });
  }
});

module.exports = router;