import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useOrder } from '../context/OrderContext';

const JoinOrder = ({ onOrderJoined }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { joinOrder } = useOrder();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate PIN
      if (!pin.trim()) {
        throw new Error('Please enter a PIN');
      }

      console.log('Attempting to join order with PIN:', pin);

      // Join the order
      const result = await joinOrder(pin.trim());

      if (result.success) {
        console.log('Successfully joined order:', result.order);
        setPin('');
        if (onOrderJoined) {
          onOrderJoined(result.order);
        }
      } else {
        throw new Error(result.error || 'Failed to join order');
      }
    } catch (err) {
      console.error('Error joining order:', err);
      setError(err.message || 'Failed to join order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Join Existing Order
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
          placeholder="e.g., 123456"
        />

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
            'Join Order'
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default JoinOrder;
