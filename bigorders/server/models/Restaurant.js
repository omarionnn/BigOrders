const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  image: String,
  dietaryInfo: {
    isVegetarian: Boolean,
    isVegan: Boolean,
    isGlutenFree: Boolean,
    isHalal: Boolean,
    isKosher: Boolean
  },
  spicyLevel: {
    type: Number,
    min: 0,
    max: 3
  },
  tags: [String]
});

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  cuisine: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  phone: String,
  email: String,
  menu: [MenuItemSchema],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  }
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
module.exports = Restaurant;
