const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Use the actual User model
const User = require('./server/models/User');

async function debugMatches() {
  try {
    console.log('Connected to MongoDB Atlas');

    // Find Sofia and check her matches
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    const noah = await User.findOne({ email: 'noah@test.com' });

    console.log('\n=== SOFIA ===');
    console.log('ID:', sofia._id);
    console.log('Matches count:', sofia.matches ? sofia.matches.length : 0);
    console.log('Matches IDs:', sofia.matches);
    console.log('SwipedRight count:', sofia.swipedRight ? sofia.swipedRight.length : 0);

    console.log('\n=== NOAH ===');
    console.log('ID:', noah._id);
    console.log('Matches count:', noah.matches ? noah.matches.length : 0);
    console.log('Matches IDs:', noah.matches);
    console.log('SwipedRight count:', noah.swipedRight ? noah.swipedRight.length : 0);

    // Try to populate matches for Sofia
    console.log('\n=== SOFIA POPULATED MATCHES ===');
    const sofiaWithMatches = await User.findById(sofia._id).populate('matches', '-password -swipedRight -swipedLeft');
    console.log('Populated matches count:', sofiaWithMatches.matches.length);
    console.log('Populated matches:', sofiaWithMatches.matches.map(m => ({ id: m._id, name: m.name, email: m.email })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugMatches();