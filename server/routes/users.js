const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('matches', 'name age photos bio email')
      .populate('swipedRight', 'name age photos bio email');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates here

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload photos
router.post('/photos', auth, upload.array('photos', 6), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const newPhotos = req.files.map(file => `/uploads/${file.filename}`);
    user.photos = [...user.photos, ...newPhotos].slice(0, 6); // Max 6 photos

    await user.save();
    res.json({ photos: user.photos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get potential matches
router.get('/potential-matches', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const { ageRange, maxDistance } = currentUser.preferences;

    // Only exclude users that have been swiped, not matches!
    const excludedIds = [
      ...currentUser.swipedRight,
      ...currentUser.swipedLeft,
      currentUser._id
    ];

    let query = {
      _id: { $nin: excludedIds },
      gender: currentUser.interestedIn === 'both' ?
        { $in: ['male', 'female', 'other'] } :
        currentUser.interestedIn,
      // Check mutual interest - other person must be interested in current user's gender
      interestedIn: { $in: [currentUser.gender, 'both'] },
      age: { $gte: ageRange.min, $lte: ageRange.max },
      isActive: { $ne: false } // Allow true or undefined, exclude false
    };

    const potentialMatches = await User.find(query)
      .select('-password -swipedRight -swipedLeft -matches')
      .limit(20);

    res.json(potentialMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Swipe action
router.post('/swipe', auth, async (req, res) => {
  try {
    const { targetUserId, action } = req.body; // action: 'like' or 'pass'
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (action === 'like') {
      currentUser.swipedRight.push(targetUserId);

      // Check if target user already liked current user
      const alreadyMutualMatch = targetUser.swipedRight.includes(currentUserId);

      // Special logic: if current user is Sofia, create automatic match
      const isSofia = currentUser.email === 'sofia@test.com';

      if (alreadyMutualMatch || isSofia) {
        // It's a match!
        currentUser.matches.push(targetUserId);
        targetUser.matches.push(currentUserId);

        // If Sofia liked someone, make sure they also "like" her back
        if (isSofia && !targetUser.swipedRight.includes(currentUserId)) {
          targetUser.swipedRight.push(currentUserId);
        }

        await targetUser.save();
        await currentUser.save();
        return res.json({ match: true, user: targetUser });
      }
    } else {
      currentUser.swipedLeft.push(targetUserId);
    }

    await currentUser.save();
    res.json({ match: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get matches
router.get('/matches', auth, async (req, res) => {
  try {
    console.log('🔍 Getting matches for user:', req.user._id);
    const user = await User.findById(req.user._id)
      .populate('matches', '-password -swipedRight -swipedLeft');

    console.log('👤 User found:', user ? user.email : 'not found');
    console.log('📊 Raw matches array:', user ? user.matches : 'no user');
    console.log('📈 Number of matches:', user ? user.matches.length : 0);

    res.json(user.matches);
  } catch (error) {
    console.error('❌ Error in matches endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

// Clear swipe history - reset all swipes for current user
router.post('/clear-swipe-history', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the matches to keep, but clear swipe history
    const currentMatches = [...currentUser.matches];

    // Clear swipe history
    currentUser.swipedRight = [];
    currentUser.swipedLeft = [];
    currentUser.matches = [];

    await currentUser.save();

    // Also remove current user from other users' swipe history (mutual reset)
    await User.updateMany(
      {},
      {
        $pull: {
          swipedRight: currentUser._id,
          swipedLeft: currentUser._id,
          matches: currentUser._id
        }
      }
    );

    // Count how many new potential matches are available
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      gender: currentUser.interestedIn === 'both' ?
        { $in: ['male', 'female', 'other'] } :
        currentUser.interestedIn,
      interestedIn: { $in: [currentUser.gender, 'both'] },
      isActive: { $ne: false }
    });

    res.json({
      success: true,
      message: 'Swipe history cleared successfully',
      newPotentialMatches: potentialMatches.length,
      previousMatches: currentMatches.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;