const Restaurant = require('../models/Restaurant');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    console.log('Fetching restaurants');
    const restaurants = await Restaurant.find()
      .select('_id name description cuisine rating')
      .lean();
    
    console.log('Found restaurants:', restaurants);
    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ 
      message: 'Error fetching restaurants',
      error: error.message 
    });
  }
};

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .select('_id name description cuisine rating menu')
      .lean();
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({ 
      message: 'Error fetching restaurant',
      error: error.message 
    });
  }
};

// @desc    Get restaurant recommendations
// @route   GET /api/restaurants/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    // Simple recommendation - return top rated restaurants
    const recommendations = await Restaurant.find()
      .sort({ rating: -1 })
      .limit(5)
      .select('_id name description cuisine rating')
      .lean();

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ 
      message: 'Error getting recommendations',
      error: error.message 
    });
  }
};

// @desc    Search restaurants
// @route   GET /api/restaurants/search
// @access  Public
const searchRestaurants = async (req, res) => {
  try {
    const { query } = req.query;
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { cuisine: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .select('_id name description cuisine rating')
    .lean();

    res.json(restaurants);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    res.status(500).json({ 
      message: 'Error searching restaurants',
      error: error.message 
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurant,
  getRecommendations,
  searchRestaurants,
};
