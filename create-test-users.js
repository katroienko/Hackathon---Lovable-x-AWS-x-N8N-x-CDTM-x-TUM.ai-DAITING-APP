const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User model
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

const User = mongoose.model('User', UserSchema);

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Clear existing users (optional - remove if you want to keep existing data)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Create User 1 - Alex (Male, interested in Female)
    const user1 = new User({
      name: 'Alex Петренко',
      email: 'alex@test.com',
      password: '123456',
      age: 25,
      gender: 'male',
      interestedIn: 'female',
      bio: 'Привіт! Я Alex, люблю подорожувати та спорт. Шукаю цікаві знайомства! 🎾',
      photos: [],
      location: {
        type: 'Point',
        coordinates: [30.5234, 50.4501] // Kyiv coordinates
      },
      preferences: {
        ageRange: { min: 20, max: 35 },
        maxDistance: 50
      },
      voicePreference: {
        voice: 'onyx',
        enabled: true
      }
    });

    // Create User 2 - Sofia (Female, interested in Male)
    const user2 = new User({
      name: 'София Коваленко',
      email: 'sofia@test.com',
      password: '123456',
      age: 23,
      gender: 'female',
      interestedIn: 'male',
      bio: 'Привіт! Я София, захоплююся мистецтвом та читанням. Шукаю щирі стосунки! 🎨📚',
      photos: [],
      location: {
        type: 'Point',
        coordinates: [30.5238, 50.4502] // Close to Alex
      },
      preferences: {
        ageRange: { min: 22, max: 30 },
        maxDistance: 50
      },
      voicePreference: {
        voice: 'nova',
        enabled: true
      }
    });

    // Save users
    await user1.save();
    await user2.save();

    console.log('✅ User 1 (Alex) created:', user1._id);
    console.log('✅ User 2 (Sofia) created:', user2._id);

    // Create mutual likes and match
    user1.swipedRight.push(user2._id);
    user1.matches.push(user2._id);

    user2.swipedRight.push(user1._id);
    user2.matches.push(user1._id);

    await user1.save();
    await user2.save();

    console.log('💕 Created mutual match between Alex and Sofia!');
    console.log('\n🎯 Test Account Credentials:');
    console.log('👤 User 1 (Alex):');
    console.log('   Email: alex@test.com');
    console.log('   Password: 123456');
    console.log('👤 User 2 (Sofia):');
    console.log('   Email: sofia@test.com');
    console.log('   Password: 123456');
    console.log('\n🚀 Now you can:');
    console.log('1. Login as alex@test.com');
    console.log('2. Go to Matches tab');
    console.log('3. Click on София Коваленко');
    console.log('4. Test voice chat! 🎤');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createTestUsers();