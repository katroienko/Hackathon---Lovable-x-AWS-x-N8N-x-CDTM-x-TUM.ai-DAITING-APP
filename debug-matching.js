const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', UserSchema);

async function debugMatching() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check Sofia's preferences and settings
    const sofia = await User.findOne({ email: 'sofia@test.com' });
    console.log('👩 Sofia settings:');
    console.log('- ID:', sofia._id);
    console.log('- Gender:', sofia.gender);
    console.log('- InterestedIn:', sofia.interestedIn);
    console.log('- Age:', sofia.age);
    console.log('- Preferences:', sofia.preferences);
    console.log('- SwipedRight:', sofia.swipedRight?.length || 0);
    console.log('- SwipedLeft:', sofia.swipedLeft?.length || 0);
    console.log('- Matches:', sofia.matches?.length || 0);

    // Check how many male users exist
    const maleCount = await User.countDocuments({ gender: 'male', isActive: { $ne: false } });
    const femaleCount = await User.countDocuments({ gender: 'female', isActive: { $ne: false } });
    console.log('\n📊 User counts:');
    console.log('- Male users:', maleCount);
    console.log('- Female users:', femaleCount);

    // Update Sofia to be interested in males and set proper preferences
    await User.findByIdAndUpdate(sofia._id, {
      gender: 'female',
      interestedIn: 'male',
      preferences: {
        ageRange: { min: 18, max: 40 },
        maxDistance: 100
      },
      swipedRight: [],
      swipedLeft: [],
      isActive: true
    });
    console.log('\n✅ Updated Sofia to be interested in males with proper preferences');

    // Test the potential matches query
    const excludedIds = [...(sofia.matches || []), sofia._id];
    const potentialMatches = await User.find({
      _id: { $nin: excludedIds },
      gender: 'male',
      age: { $gte: 18, $lte: 40 },
      isActive: { $ne: false }
    }).select('name age gender bio photos').limit(10);

    console.log('\n🔍 Potential matches found:', potentialMatches.length);
    potentialMatches.forEach(user => {
      console.log(`- ${user.name} (${user.age}, ${user.gender})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugMatching();