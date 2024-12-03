const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserProfile,
  updateUserProfile,
  getTasteProfile,
  updateTasteProfile
} = require('../controllers/profileController');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', protect, getUserProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, updateUserProfile);

// @route   GET /api/profile/taste
// @desc    Get user's taste profile
// @access  Private
router.get('/taste', protect, getTasteProfile);

// @route   PUT /api/profile/taste
// @desc    Update user's taste profile
// @access  Private
router.put('/taste', protect, updateTasteProfile);

module.exports = router;
