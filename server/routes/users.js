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
    const user = await User.findById(req.user._id).select('-password');
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

    const excludedIds = [
      ...currentUser.swipedRight,
      ...currentUser.swipedLeft,
      ...currentUser.matches,
      currentUser._id
    ];

    let query = {
      _id: { $nin: excludedIds },
      gender: currentUser.interestedIn === 'both' ?
        { $in: ['male', 'female', 'other'] } :
        currentUser.interestedIn,
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
      if (targetUser.swipedRight.includes(currentUserId)) {
        // It's a match!
        currentUser.matches.push(targetUserId);
        targetUser.matches.push(currentUserId);
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
    const user = await User.findById(req.user._id)
      .populate('matches', '-password -swipedRight -swipedLeft');

    res.json(user.matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;