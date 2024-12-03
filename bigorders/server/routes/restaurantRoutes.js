const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurant,
  getRecommendations,
  searchRestaurants,
} = require('../controllers/restaurantController');
const { protect } = require('../middleware/auth');

router.get('/', getRestaurants);
router.get('/search', searchRestaurants);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getRestaurant);

module.exports = router;
