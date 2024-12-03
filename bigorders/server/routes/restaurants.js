const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  getRecommendations,
  searchRestaurants,
} = require('../controllers/restaurantController');

// Get all restaurants (public route)
router.get('/', getRestaurants);

// Search restaurants (public route)
router.get('/search', searchRestaurants);

// Get restaurant recommendations (protected route)
router.get('/recommendations', getRecommendations);

// Get single restaurant (public route)
router.get('/:id', getRestaurant);

module.exports = router;
