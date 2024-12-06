import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useOrder } from '../context/OrderContext';

const CreateOrder = ({ restaurants, onOrderCreated }) => {
  const [orderName, setOrderName] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createOrder } = useOrder();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!orderName.trim()) {
        throw new Error('Please enter an order name');
      }
      if (!selectedRestaurant) {
        throw new Error('Please select a restaurant');
      }

      console.log('Creating order with:', {
        name: orderName,
        restaurantId: selectedRestaurant
      });

      // Create the order
      const result = await createOrder({
        name: orderName.trim(),
        restaurantId: selectedRestaurant
      });

      if (result.success) {
        console.log('Order created successfully:', result.order);
        setOrderName('');
        setSelectedRestaurant('');
        if (onOrderCreated) {
          onOrderCreated(result.order);
        }
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Order
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Order Name"
          value={orderName}
          onChange={(e) => setOrderName(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
        />

        <FormControl fullWidth margin="normal" required>
          <InputLabel>Select Restaurant</InputLabel>
          <Select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            label="Select Restaurant"
            disabled={isLoading}
          >
            {restaurants?.map((restaurant) => (
              <MenuItem key={restaurant._id} value={restaurant._id}>
                {restaurant.name} - {restaurant.cuisine}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Create Order'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateOrder;
