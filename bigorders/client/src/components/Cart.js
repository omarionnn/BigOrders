import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { useOrder } from '../context/OrderContext';
import Receipt from './Receipt';

const Cart = ({ items, onRemoveItem, onClearCart, onCheckout }) => {
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const { generateReceipt, currentOrder, loading } = useOrder();

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleGenerateReceipt = async () => {
    try {
      setError(null);
      const result = await generateReceipt(currentOrder._id);
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        setError(result.error || 'Failed to generate receipt');
      }
    } catch (err) {
      setError('An error occurred while generating the receipt');
      console.error('Error:', err);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Your Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {items.map((item) => (
          <ListItem key={item._id}>
            <ListItemText
              primary={item.name}
              secondary={`$${item.price.toFixed(2)} x ${item.quantity}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => onRemoveItem(item._id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Total: ${total.toFixed(2)}
      </Typography>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ShoppingCartCheckoutIcon />}
          onClick={onCheckout}
          disabled={items.length === 0 || loading}
        >
          Checkout
        </Button>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<ReceiptIcon />}
          onClick={handleGenerateReceipt}
          disabled={loading}
        >
          Generate Receipt
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<RemoveShoppingCartIcon />}
          onClick={onClearCart}
          disabled={items.length === 0 || loading}
        >
          Clear Cart
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {receipt && <Receipt receipt={receipt} />}
    </Paper>
  );
};

export default Cart;
