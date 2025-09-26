const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// User model - simplified version
const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function createMutualMatch() {
  try {
    console.log('Connected to MongoDB Atlas');

    // Find Sofia and Noah
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    const noah = await User.findOne({ email: 'noah@test.com' });

    if (!sofia || !noah) {
      console.error('Sofia or Noah not found');
      return;
    }

    console.log('Sofia ID:', sofia._id);
    console.log('Noah ID:', noah._id);

    // Create mutual likes
    sofia.swipedRight = sofia.swipedRight || [];
    sofia.matches = sofia.matches || [];
    noah.swipedRight = noah.swipedRight || [];
    noah.matches = noah.matches || [];

    // Add to swipedRight if not already there
    if (!sofia.swipedRight.includes(noah._id)) {
      sofia.swipedRight.push(noah._id);
    }
    if (!noah.swipedRight.includes(sofia._id)) {
      noah.swipedRight.push(sofia._id);
    }

    // Add to matches if not already there
    if (!sofia.matches.includes(noah._id)) {
      sofia.matches.push(noah._id);
    }
    if (!noah.matches.includes(sofia._id)) {
      noah.matches.push(sofia._id);
    }

    await sofia.save();
    await noah.save();

    console.log('✅ Created mutual match between Sofia and Noah!');
    console.log('Sofia matches:', sofia.matches.length);
    console.log('Noah matches:', noah.matches.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createMutualMatch();