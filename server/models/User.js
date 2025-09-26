const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 18
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  interestedIn: {
    type: String,
    enum: ['male', 'female', 'both'],
    required: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  photos: [{
    type: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  preferences: {
    ageRange: {
      min: { type: Number, default: 18 },
      max: { type: Number, default: 100 }
    },
    maxDistance: { type: Number, default: 50 }
  },
  swipedRight: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  swipedLeft: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  voicePreference: {
    voice: { type: String, default: 'alloy' },
    enabled: { type: Boolean, default: true }
  },
  customVoice: {
    elevenLabsVoiceId: { type: String },
    name: { type: String },
    status: { type: String, enum: ['pending', 'processing', 'ready', 'failed'], default: 'pending' },
    audioSamplePath: { type: String },
    createdAt: { type: Date },
    error: { type: String }
  }
}, {
  timestamps: true
});

UserSchema.index({ location: '2dsphere' });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);