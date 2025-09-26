const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const User = require('./server/models/User');

async function fixMatches() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Find Sofia
    console.log('🔍 Finding Sofia...');
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    if (!sofia) {
      console.error('❌ Sofia not found');
      return;
    }
    console.log('👤 Found Sofia:', sofia._id);

    // Find all male users
    console.log('🔍 Finding male users...');
    const males = await User.find({
      gender: 'male',
      _id: { $ne: sofia._id }
    });
    console.log('👥 Found', males.length, 'male users');

    // Clear Sofia's current data
    console.log('🧹 Clearing Sofia\'s existing relationships...');
    sofia.swipedRight = [];
    sofia.swipedLeft = [];
    sofia.matches = [];

    let totalMatches = 0;

    // For each male user
    console.log('💕 Creating matches...');
    for (const male of males) {
      console.log(`  Creating match with ${male.name} (${male.email})`);

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

    // Wait a moment to ensure write propagation
    console.log('⏳ Waiting for database propagation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify the matches were saved correctly
    console.log('🔍 Verifying matches...');
    const verifyUser = await User.findById(sofia._id)
      .populate('matches', 'name email');

    console.log('👤 Sofia matches count:', verifyUser.matches.length);
    console.log('📊 Sofia matches:', verifyUser.matches.map(m => ({ name: m.name, email: m.email })));

    if (verifyUser.matches.length === totalMatches) {
      console.log('✅ Verification successful! All matches are properly saved.');
    } else {
      console.log('⚠️ Verification failed! Expected', totalMatches, 'but found', verifyUser.matches.length);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

fixMatches();