const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      dietaryPreferences,
      favorites
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (dietaryPreferences) profileFields.dietaryPreferences = dietaryPreferences;
    if (favorites) profileFields.favorites = favorites;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ 
      message: 'Error updating user profile',
      error: error.message 
    });
  }
};

// @desc    Get user taste profile
// @route   GET /api/profile/taste
// @access  Private
const getTasteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('tasteProfile')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.tasteProfile || {});
  } catch (error) {
    console.error('Error fetching taste profile:', error);
    res.status(500).json({ 
      message: 'Error fetching taste profile',
      error: error.message 
    });
  }
};

// @desc    Update user taste profile
// @route   PUT /api/profile/taste
// @access  Private
const updateTasteProfile = async (req, res) => {
  try {
    const { tasteProfile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { tasteProfile } },
      { new: true }
    ).select('tasteProfile');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.tasteProfile);
  } catch (error) {
    console.error('Error updating taste profile:', error);
    res.status(500).json({ 
      message: 'Error updating taste profile',
      error: error.message 
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getTasteProfile,
  updateTasteProfile
};
