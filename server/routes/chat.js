const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// Get chat messages between two users
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate('sender', 'name photos')
    .populate('receiver', 'name photos')
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', voiceData } = req.body;
    const senderId = req.user._id;

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      voiceData
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name photos')
      .populate('receiver', 'name photos');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.put('/read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      { sender: userId, receiver: currentUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get chat list with last messages
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const chatList = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            name: '$user.name',
            photos: '$user.photos'
          },
          lastMessage: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json(chatList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;