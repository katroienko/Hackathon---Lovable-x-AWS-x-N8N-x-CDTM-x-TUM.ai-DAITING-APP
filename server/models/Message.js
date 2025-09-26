const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'image'],
    default: 'text'
  },
  voiceData: {
    audioUrl: String,
    duration: Number,
    transcript: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);