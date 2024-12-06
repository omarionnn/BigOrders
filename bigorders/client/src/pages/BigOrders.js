import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Slide,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/axios';

const MotionPaper = motion(Paper);

const BigOrders = () => {
  const navigate = useNavigate();
  const { createOrder, joinOrder, generateReceipt, loading, error: orderError } = useOrder();
  const { user } = useAuth();
  const [mode, setMode] = useState(null);
  const [orderName, setOrderName] = useState('');
  const [pin, setPin] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPin, setSuccessPin] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log('Fetching restaurants...');
        const response = await api.get('/api/restaurants');
        console.log('Restaurant API response:', response);
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Setting restaurants:', response.data);
          setRestaurants(response.data);
          // Make restaurants available globally for debugging
          window.debugRestaurants = response.data;
          setError(null);
        } else {
          console.error('Invalid restaurant data format:', response.data);
          throw new Error('Invalid restaurant data received');
        }
      } catch (err) {
        console.error('Error fetching restaurants:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError('Failed to load restaurants. Please try again.');
      }
    };
    fetchRestaurants();
  }, []);

  useEffect(() => {
    console.log('Current restaurants state:', restaurants);
  }, [restaurants]);

  const handleCreateOrder = async () => {
    setError(null);
    
    // Debug logging
    console.log('%c=== ORDER CREATION ATTEMPT ===', 'color: blue; font-weight: bold');
    console.log('%c1. Auth Status:', 'color: blue', {
      user,
      isLoggedIn: !!user,
      token: localStorage.getItem('token') ? 'Present' : 'Missing'
    });
    
    console.log('%c2. Form Data:', 'color: blue', {
      orderName,
      selectedRestaurant,
      restaurantsList: restaurants,
      selectedRestaurantDetails: restaurants.find(r => r._id === selectedRestaurant)
    });

    // Validate inputs
    if (!orderName.trim()) {
      const msg = 'Please enter an order name';
      console.log('%cValidation Error:', 'color: red', msg);
      setError(msg);
      return;
    }
    if (!selectedRestaurant) {
      const msg = 'Please select a restaurant';
      console.log('%cValidation Error:', 'color: red', msg);
      setError(msg);
      return;
    }

    try {
      console.log('%c3. Sending Create Order Request:', 'color: blue', {
        restaurantId: selectedRestaurant,
        name: orderName.trim()
      });

      const result = await createOrder({
        restaurantId: selectedRestaurant,
        name: orderName.trim()
      });
      console.log('%c4. Create Order Result:', 'color: blue', result);

      if (result.success) {
        console.log('%cOrder Created Successfully:', 'color: green', result.order);
        setError(null);
        setSuccessPin(result.order.pin);
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/recommended');
        }, 5000);
      } else {
        console.log('%cOrder Creation Failed:', 'color: red', result.error);
        setError(result.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('%cError in handleCreateOrder:', 'color: red', {
        error: err,
        message: err.message,
        response: err.response?.data
      });
      setError(err.message || 'Failed to create order. Please try again.');
    }
  };

  const handleJoinOrder = async () => {
    try {
      console.log('=== JOIN ORDER DEBUG ===');
      console.log('1. Starting join order process');
      console.log('2. PIN:', pin);
      console.log('3. Auth state:', {
        isAuthenticated: !!user,
        user: user
      });

      const result = await joinOrder(pin.trim());
      
      console.log('4. Join order result:', result);

      if (result.success) {
        console.log('5. Successfully joined order:', result.order);
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/recommended');
        }, 5000);
      } else {
        console.error('5. Failed to join order:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('Error in handleJoinOrder:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Failed to join order');
    }
  };

  const handlePinChange = (e) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
    setPin(value);
  };

  const handleGenerateReceipt = async () => {
    try {
      const result = await generateReceipt();
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        setError(result.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8 }}>
        {!mode ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              textAlign="center"
              sx={{ mb: 6 }}
            >
              Welcome to BigOrders, {user?.name}!
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <MotionPaper
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  onClick={() => setMode('create')}
                >
                  <AddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Create a BigOrder
                  </Typography>
                  <Typography color="text.secondary">
                    Start a new group order and invite others to join
                  </Typography>
                </MotionPaper>
              </Grid>
              <Grid item xs={12} md={6}>
                <MotionPaper
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  onClick={() => setMode('join')}
                >
                  <GroupAddIcon
                    sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Join a BigOrder
                  </Typography>
                  <Typography color="text.secondary">
                    Join an existing group order using a PIN
                  </Typography>
                </MotionPaper>
              </Grid>
            </Grid>
          </motion.div>
        ) : (
          <Slide direction="up" in={true} mountOnEnter unmountOnExit>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Button
                onClick={() => setMode(null)}
                sx={{ mb: 3 }}
                variant="outlined"
              >
                Back
              </Button>
              <Typography variant="h4" gutterBottom>
                {mode === 'create' ? 'Create a BigOrder' : 'Join a BigOrder'}
              </Typography>
              {orderError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {orderError}
                </Alert>
              )}
              {mode === 'create' ? (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="restaurant-select-label">Restaurant</InputLabel>
                        <Select
                          labelId="restaurant-select-label"
                          id="restaurant-select"
                          value={selectedRestaurant}
                          label="Restaurant"
                          onChange={(e) => setSelectedRestaurant(e.target.value)}
                        >
                          {restaurants.map((restaurant) => (
                            <MenuItem key={restaurant._id} value={restaurant._id}>
                              {restaurant.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Order Name"
                        value={orderName}
                        onChange={(e) => setOrderName(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleCreateOrder}
                          disabled={!selectedRestaurant || !orderName || loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Create Order'}
                        </Button>
                        {receipt && (
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleGenerateReceipt}
                            disabled={loading}
                          >
                            Generate Receipt
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  {receipt && (
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h5" gutterBottom>
                        Order Receipt
                      </Typography>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>User</TableCell>
                              <TableCell>Items</TableCell>
                              <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {receipt.userOrders.map((userOrder) => (
                              <TableRow key={userOrder.userId}>
                                <TableCell>{userOrder.userName}</TableCell>
                                <TableCell>
                                  {userOrder.items.map((item) => (
                                    <Box key={item._id}>
                                      {item.quantity}x {item.name} - ${item.price.toFixed(2)}
                                    </Box>
                                  ))}
                                </TableCell>
                                <TableCell align="right">
                                  ${userOrder.subtotal.toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={2} align="right">
                                <strong>Total:</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>${receipt.total.toFixed(2)}</strong>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Enter 6-digit PIN"
                    value={pin}
                    onChange={handlePinChange}
                    sx={{ mb: 3 }}
                    inputProps={{ maxLength: 6 }}
                    helperText="Enter the 6-digit PIN shared with you"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleJoinOrder}
                    disabled={loading || pin.length !== 6}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Join Order'}
                  </Button>
                </>
              )}
            </Paper>
          </Slide>
        )}

        <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
          <DialogTitle>Order Created Successfully!</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Your order has been created. Share this PIN with others to let them
              join:
            </Typography>
            <Typography
              variant="h2"
              component="div"
              sx={{ textAlign: 'center', my: 3 }}
            >
              {successPin}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll be redirected to the recommendations page in a few seconds...
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => navigate('/recommended')}>
              Go to Recommendations
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default BigOrders;
