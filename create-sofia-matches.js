const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI);
const User = require('./server/models/User');

async function createSofiaMatches() {
  try {
    console.log('Connected to MongoDB Atlas');
    
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    if (!sofia) {
      console.error('Sofia not found');
      return;
    }

    const males = await User.find({ gender: 'male', _id: { $ne: sofia._id } });
    console.log('Found', males.length, 'male users');

    sofia.swipedRight = sofia.swipedRight || [];
    sofia.matches = sofia.matches || [];

    let newMatchesCount = 0;
    for (const male of males) {
      male.swipedRight = male.swipedRight || [];
      male.matches = male.matches || [];

      if (!sofia.swipedRight.some(id => id.equals(male._id))) {
        sofia.swipedRight.push(male._id);
      }
      if (!male.swipedRight.some(id => id.equals(sofia._id))) {
        male.swipedRight.push(sofia._id);
      }
      if (!sofia.matches.some(id => id.equals(male._id))) {
        sofia.matches.push(male._id);
        newMatchesCount++;
      }
      if (!male.matches.some(id => id.equals(sofia._id))) {
        male.matches.push(sofia._id);
      }

      await male.save();
    }

    await sofia.save();
    console.log('✅ Created', newMatchesCount, 'new matches for Sofia!');
    console.log('Sofia now has', sofia.matches.length, 'total matches');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createSofiaMatches();
