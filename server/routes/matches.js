const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all matches for current user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('matches', 'name age photos bio')
      .select('matches');

    res.json(user.matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unmatch with a user
router.delete('/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;
    const currentUserId = req.user._id;

    // Remove match from current user
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { matches: matchId }
    });

    // Remove match from target user
    await User.findByIdAndUpdate(matchId, {
      $pull: { matches: currentUserId }
    });

    res.json({ message: 'Successfully unmatched' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;