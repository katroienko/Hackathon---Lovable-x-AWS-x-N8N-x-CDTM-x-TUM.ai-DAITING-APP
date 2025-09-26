const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

mongoose.connect(process.env.MONGODB_URI);
const User = require('./server/models/User');

async function debugMatchesAPI() {
  try {
    console.log('Connected to MongoDB Atlas');

    const sofiaId = '68d57d0300c417f309277ff9';

    console.log('\n=== Step 1: Find Sofia without population ===');
    const sofiaBasic = await User.findById(sofiaId);
    console.log('Sofia matches (raw ObjectIds):', sofiaBasic.matches);
    console.log('Number of matches:', sofiaBasic.matches.length);

    console.log('\n=== Step 2: Try to populate matches ===');
    const sofiaPopulated = await User.findById(sofiaId)
      .populate('matches', '-password -swipedRight -swipedLeft');

    console.log('Sofia matches (populated):', sofiaPopulated.matches);
    console.log('Number of populated matches:', sofiaPopulated.matches.length);

    console.log('\n=== Step 3: Check if the referenced users exist ===');
    for (let i = 0; i < sofiaBasic.matches.length; i++) {
      const matchId = sofiaBasic.matches[i];
      const matchUser = await User.findById(matchId);
      console.log(`Match ${i + 1}:`, matchUser ? `${matchUser.name} (${matchUser.email})` : 'NOT FOUND');
    }

    console.log('\n=== Step 4: Try alternative population ===');
    const sofiaAlt = await User.findById(sofiaId).populate({
      path: 'matches',
      select: 'name email photos age bio',
    });

    console.log('Alternative population result:', sofiaAlt.matches.length);
    console.log('Alternative matches:', sofiaAlt.matches.map(m => ({ name: m.name, email: m.email })));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

debugMatchesAPI();