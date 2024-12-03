import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Container,
  Grid,
  Paper,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { useCart } from '../context/CartContext';
import { useOrder } from '../context/OrderContext';
import Receipt from '../components/Receipt';
import api from '../config/axios';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { currentOrder, generateReceipt } = useOrder();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts or currentOrder changes
    setError(null);
  }, [currentOrder]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <Container maxWidth="md">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
        </Box>
      </Container>
    );
  }

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentOrder?._id) {
        throw new Error('No active order found. Please join or create an order first.');
      }

      console.log('Current order:', currentOrder);

      // Format items for the API
      const items = cartItems.map(item => ({
        item: item.item._id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      }));

      console.log('Submitting order items:', items);

      // Update order items
      const response = await api.put(`/api/orders/${currentOrder._id}/items`, { items });
      console.log('Order updated:', response.data);

      // Generate receipt after successful checkout
      const receiptResult = await generateReceipt();
      if (receiptResult.success) {
        setReceipt(receiptResult.receipt);
        clearCart(); // Clear the cart after successful checkout
      } else {
        throw new Error(receiptResult.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      let errorMessage = 'Failed to process checkout';
      
      if (err.response?.status === 404) {
        errorMessage = 'Order not found. Please make sure you have joined or created an order.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReceipt = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentOrder?._id) {
        throw new Error('No active order found. Please join or create an order first.');
      }

      const result = await generateReceipt();
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        setError(result.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
      let errorMessage = 'Failed to generate receipt';
      
      if (err.response?.status === 404) {
        errorMessage = 'Order not found. Please make sure you have joined or created an order.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>

        {!currentOrder && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please join or create an order before checking out.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {cartItems.map((cartItem) => (
          <Card key={cartItem.item._id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">{cartItem.item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cartItem.specialInstructions || 'No special instructions'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() =>
                        updateQuantity(cartItem.item._id, Math.max(0, cartItem.quantity - 1))
                      }
                      disabled={loading}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{cartItem.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        updateQuantity(cartItem.item._id, cartItem.quantity + 1)
                      }
                      disabled={loading}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => removeFromCart(cartItem.item._id)}
                      sx={{ ml: 2 }}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Typography sx={{ ml: 2, minWidth: 80 }} align="right">
                      ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Paper sx={{ p: 2, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${getCartTotal().toFixed(2)}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={loading ? null : <ShoppingCartCheckoutIcon />}
              onClick={handleCheckout}
              disabled={loading || !currentOrder}
            >
              {loading ? <CircularProgress size={24} /> : `Checkout ($${getCartTotal().toFixed(2)})`}
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={loading ? null : <ReceiptIcon />}
              onClick={handleGenerateReceipt}
              disabled={loading || !currentOrder}
            >
              {loading && receipt === null ? <CircularProgress size={24} /> : 'Generate Receipt'}
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<RemoveShoppingCartIcon />}
              onClick={clearCart}
              disabled={loading}
            >
              Clear Cart
            </Button>
          </Box>
        </Paper>

        {receipt && <Receipt receipt={receipt} />}
      </Box>
    </Container>
  );
};

export default Cart;
