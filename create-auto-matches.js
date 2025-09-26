const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI);
const User = require('./server/models/User');

async function createAutoMatches() {
  try {
    console.log('Connected to MongoDB Atlas');

    // Find Sofia
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    if (!sofia) {
      console.error('Sofia not found');
      return;
    }

    // Find all male users
    const males = await User.find({
      gender: 'male',
      _id: { $ne: sofia._id }
    });

    console.log('Found', males.length, 'male users');

    // Clear Sofia's current data
    sofia.swipedRight = [];
    sofia.swipedLeft = [];
    sofia.matches = [];

    let totalMatches = 0;

    // For each male user
    for (const male of males) {
      // Clear their existing relationships with Sofia
      male.swipedRight = male.swipedRight.filter(id => !id.equals(sofia._id));
      male.swipedLeft = male.swipedLeft.filter(id => !id.equals(sofia._id));
      male.matches = male.matches.filter(id => !id.equals(sofia._id));

      // Create mutual likes and matches
      if (!sofia.swipedRight.some(id => id.equals(male._id))) {
        sofia.swipedRight.push(male._id);
      }
      if (!male.swipedRight.some(id => id.equals(sofia._id))) {
        male.swipedRight.push(sofia._id);
      }

      if (!sofia.matches.some(id => id.equals(male._id))) {
        sofia.matches.push(male._id);
        totalMatches++;
      }
      if (!male.matches.some(id => id.equals(sofia._id))) {
        male.matches.push(sofia._id);
      }

      await male.save();
    }

    await sofia.save();

    console.log('✅ Created', totalMatches, 'automatic matches for Sofia!');
    console.log('Now Sofia will see matches whenever she likes someone');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAutoMatches();