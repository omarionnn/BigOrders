import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Rating,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';

const mockRestaurantData = {
  menu: [
    {
      _id: '1',
      name: 'Spicy Chicken Bowl',
      description: 'Grilled chicken with spicy sauce and fresh vegetables',
      price: 12.99,
      image: 'https://source.unsplash.com/random/400x300/?food,chicken',
      dietaryInfo: ['Gluten-Free', 'High-Protein'],
      spicyLevel: 'Medium',
      tasteProfile: ['Spicy', 'Savory'],
      popularity: 4.5,
      rating: 4.5,
      cuisine: 'Asian Fusion'
    },
    {
      _id: '2',
      name: 'Vegetarian Buddha Bowl',
      description: 'Fresh vegetables, quinoa, and tahini dressing',
      price: 11.99,
      image: 'https://source.unsplash.com/random/400x300/?food,salad',
      dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      spicyLevel: 'Mild',
      tasteProfile: ['Fresh', 'Healthy'],
      popularity: 4.8,
      rating: 4.7,
      cuisine: 'Healthy'
    },
    {
      _id: '3',
      name: 'Salmon Poke Bowl',
      description: 'Fresh salmon, rice, avocado, and special sauce',
      price: 14.99,
      image: 'https://source.unsplash.com/random/400x300/?food,salmon',
      dietaryInfo: ['Gluten-Free', 'High-Protein'],
      spicyLevel: 'Mild',
      tasteProfile: ['Fresh', 'Umami'],
      popularity: 4.9,
      rating: 4.8,
      cuisine: 'Japanese'
    }
  ]
};

const Recommended = () => {
  const { user } = useAuth();
  const { currentOrder, selectedRestaurant } = useOrder();
  const { addToCart } = useCart();
  const [recommendations, setRecommendations] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    // In a real app, this would be an API call to get personalized recommendations
    const generateRecommendations = () => {
      const userPreferences = user?.tasteProfile || {};
      // Using mock data for now
      const menuItems = mockRestaurantData.menu;

      // For now, just return all items since we're using mock data
      setRecommendations(menuItems);
    };

    generateRecommendations();
  }, [user]);

  const handleAddToCart = () => {
    addToCart(selectedItem, quantity, specialInstructions);
    setSelectedItem(null);
    setQuantity(1);
    setSpecialInstructions('');
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        component={motion.h1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        variant="h4"
        gutterBottom
      >
        Recommended for You
      </Typography>

      <Grid container spacing={3}>
        <AnimatePresence>
          {recommendations.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6">
                      {item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {item.description}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 2 }}>
                      {item.dietaryInfo && item.dietaryInfo.map((diet) => (
                        <Chip
                          key={diet}
                          label={diet}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        ${item.price.toFixed(2)}
                      </Typography>
                      <Rating value={item.rating} readOnly size="small" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => setSelectedItem(item)}
                        startIcon={<AddIcon />}
                      >
                        Add to Cart
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </AnimatePresence>
      </Grid>

      <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)}>
        <DialogTitle>{selectedItem?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography gutterBottom>Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <RemoveIcon />
              </IconButton>
              <Typography sx={{ mx: 2 }}>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(quantity + 1)}>
                <AddIcon />
              </IconButton>
            </Box>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Special Instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)}>Cancel</Button>
          <Button onClick={handleAddToCart} variant="contained">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Recommended;
