const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

const restaurantData = [
  {
    name: "Mario's Italian Kitchen",
    description: "Authentic Italian cuisine in a cozy atmosphere",
    cuisine: "Italian",
    menu: [
      {
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, and basil",
        price: 14.99,
        category: "Pizza",
        dietaryInfo: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false
        }
      },
      {
        name: "Spaghetti Carbonara",
        description: "Classic carbonara with pancetta and egg",
        price: 16.99,
        category: "Pasta",
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false
        }
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert",
        price: 8.99,
        category: "Dessert",
        dietaryInfo: {
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false
        }
      }
    ]
  },
  {
    name: "Sushi Master",
    description: "Fresh and creative Japanese cuisine",
    cuisine: "Japanese",
    menu: [
      {
        name: "California Roll",
        description: "Crab, avocado, and cucumber",
        price: 12.99,
        category: "Rolls",
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true
        }
      },
      {
        name: "Salmon Nigiri",
        description: "Fresh salmon over rice",
        price: 8.99,
        category: "Nigiri",
        dietaryInfo: {
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: true
        }
      },
      {
        name: "Vegetable Tempura",
        description: "Assorted vegetables in crispy batter",
        price: 10.99,
        category: "Appetizers",
        dietaryInfo: {
          isVegetarian: true,
          isVegan: true,
          isGlutenFree: false
        }
      }
    ]
  }
];

const seedRestaurants = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/bigorders', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing restaurants
    await Restaurant.deleteMany({});
    console.log('Cleared existing restaurants');

    // Insert new restaurants
    const restaurants = await Restaurant.insertMany(restaurantData);
    console.log('Inserted restaurants:', restaurants.map(r => r.name));

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedRestaurants();
