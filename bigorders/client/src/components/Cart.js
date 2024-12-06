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
import { useAuth } from '../context/AuthContext';
import Receipt from './Receipt';
import api from '../config/axios';
import { TestLogger, validateCartItem } from '../utils/testHelper';

const Cart = ({ items, onRemoveItem, onClearCart, onCheckout }) => {
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const { generateReceipt, currentOrder, loading } = useOrder();
  const { user } = useAuth();

  const total = items.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

  const handleCheckout = async () => {
    try {
      console.log('\n=== CHECKOUT DEBUG (Client) ===');
      setError(null);
      
      // Debug log the initial state
      console.log('1. Initial state:', {
        userId: user?._id,
        orderId: currentOrder?._id,
        itemCount: items?.length,
        items: items.map(item => ({
          id: item.item?._id,
          name: item.item?.name,
          price: item.item?.price,
          quantity: item.quantity
        }))
      });

      // Validate user and order
      if (!user) {
        throw new Error('Please log in to checkout');
      }

      if (!currentOrder) {
        throw new Error('No active order found');
      }

      // Format and validate items
      const formattedItems = items.map((cartItem, index) => {
        console.log(`2. Processing item ${index + 1}:`, {
          raw: {
            id: cartItem.item?._id,
            name: cartItem.item?.name,
            price: cartItem.item?.price,
            quantity: cartItem.quantity,
            specialInstructions: cartItem.specialInstructions
          }
        });
        
        // Validate item structure
        if (!cartItem?.item?._id || !cartItem?.item?.name || cartItem?.item?.price === undefined) {
          console.error(`Invalid structure for item ${index + 1}:`, {
            id: cartItem.item?._id,
            name: cartItem.item?.name,
            price: cartItem.item?.price,
            quantity: cartItem.quantity
          });
          throw new Error(`Invalid item structure: ${cartItem?.item?.name || 'Unknown item'}`);
        }

        // Parse price and quantity
        let price = cartItem.item.price;
        if (typeof price === 'string') {
          price = parseFloat(price.replace(/[$,]/g, ''));
        }
        const quantity = parseInt(cartItem.quantity, 10);
        
        console.log(`3. Parsed values for item ${index + 1}:`, {
          name: cartItem.item.name,
          originalPrice: cartItem.item.price,
          parsedPrice: price,
          originalQuantity: cartItem.quantity,
          parsedQuantity: quantity,
          isNaNPrice: isNaN(price),
          isNaNQuantity: isNaN(quantity)
        });

        // Validate numbers
        if (isNaN(price) || price <= 0) {
          throw new Error(`Invalid price for item: ${cartItem.item.name}`);
        }
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error(`Invalid quantity for item: ${cartItem.item.name}`);
        }

        // Calculate subtotal with proper rounding
        const subtotal = Math.round((price * quantity) * 100) / 100;

        const formattedItem = {
          id: cartItem.item._id,
          name: cartItem.item.name.trim(),
          price: price,
          quantity: quantity,
          notes: cartItem.specialInstructions?.trim() || '',
          subtotal: subtotal
        };

        console.log(`4. Formatted item ${index + 1}:`, formattedItem);
        return formattedItem;
      });

      // Calculate total for verification
      const cartTotal = formattedItems.reduce((sum, item) => sum + item.subtotal, 0);
      console.log('5. Cart summary:', {
        itemCount: formattedItems.length,
        items: formattedItems,
        total: cartTotal
      });

      console.log('6. Sending request:', {
        url: `/api/orders/${currentOrder._id}/items`,
        method: 'PUT',
        data: { items: formattedItems }
      });

      // Send update request
      const response = await api.put(`/api/orders/${currentOrder._id}/items`, {
        items: formattedItems
      });

      console.log('7. Server response:', response.data);

      if (response.data.success) {
        onCheckout();
      } else {
        throw new Error(response.data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setError(error.message || 'Failed to process checkout');
    }
  };

  const handleGenerateReceipt = async () => {
    try {
      setError(null);
      console.log('=== GENERATE RECEIPT DEBUG (Cart Component) ===');
      
      // Validate current order
      if (!currentOrder?._id) {
        setError('No active order found. Please create or join an order first.');
        return;
      }

      console.log('1. Current order:', {
        orderId: currentOrder?._id,
        name: currentOrder?.name,
        status: currentOrder?.status
      });

      // Generate the receipt
      console.log('2. Generating receipt...');
      const result = await generateReceipt();
      console.log('3. Generate receipt result:', {
        success: result.success,
        orderName: result.receipt?.order?.name,
        participantCount: result.receipt?.participants?.length,
        participants: result.receipt?.participants?.map(p => ({
          name: p.user.name,
          role: p.role,
          itemCount: p.items?.length,
          total: p.total
        }))
      });
      
      if (result.success) {
        setReceipt(result.receipt);
      } else {
        setError(result.error || 'Failed to generate receipt');
      }
    } catch (err) {
      console.error('Error generating receipt:', err);
      setError(err.message || 'An error occurred while generating the receipt');
    }
  };

  const handleTestReceipt = () => {
    const mockReceipt = {
      order: {
        name: "Test Order",
        pin: "1234"
      },
      restaurant: {
        name: "Test Restaurant",
        cuisine: "Test Cuisine",
        address: "123 Test St"
      },
      participants: [
        {
          user: {
            name: "Test User 1",
            _id: "user1"
          },
          role: "Owner",
          items: [
            {
              name: "Test Item 1",
              quantity: 2,
              price: 9.99,
              notes: "Test note"
            }
          ],
          total: 19.98
        }
      ],
      creator: {
        name: "Test Creator"
      }
    };
    setReceipt(mockReceipt);
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
              primary={item.item.name}
              secondary={`$${item.item.price.toFixed(2)} x ${item.quantity}`}
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
          onClick={handleCheckout}
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
          color="warning"
          startIcon={<ReceiptIcon />}
          onClick={handleTestReceipt}
        >
          Test Receipt
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
