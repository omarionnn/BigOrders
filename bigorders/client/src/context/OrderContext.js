import React, { createContext, useContext, useState } from 'react';
import api from '../config/axios';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = async (restaurantId, name) => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the request data
      console.log('=== CLIENT ORDER CREATION ===');
      console.log('1. Request Data:', {
        restaurantId,
        name,
        token: localStorage.getItem('token') ? 'Present' : 'Missing'
      });

      // Validate input
      if (!restaurantId) {
        throw new Error('Restaurant ID is required');
      }
      if (!name || !name.trim()) {
        throw new Error('Order name is required');
      }

      // Make the request
      console.log('2. Sending request to:', '/orders');
      const response = await api.post('/orders', {
        restaurantId,
        name: name.trim()
      });

      console.log('3. Server response:', response.data);
      
      if (response.data.success) {
        setCurrentOrder(response.data.order);
        return { success: true, order: response.data.order };
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      console.error('Error in createOrder:', {
        name: err.name,
        message: err.message,
        response: {
          status: err.response?.status,
          data: err.response?.data,
          headers: err.response?.headers
        }
      });
      
      // Provide more specific error messages
      let errorMessage;
      if (err.response?.status === 401) {
        errorMessage = 'Please log in to create an order';
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 
                      (Array.isArray(err.response.data?.errors) ? 
                        err.response.data.errors.join(', ') : 
                        'Invalid order data provided');
      } else if (err.response?.status === 404) {
        errorMessage = 'Restaurant not found';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else {
        errorMessage = err.message || 'Failed to create order';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const joinOrder = async (pin) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('orders/join', { pin });
      console.log('Joined order:', response.data);
      setCurrentOrder(response.data);
      return { success: true, order: response.data };
    } catch (err) {
      console.error('Error joining order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentOrder?._id) {
        throw new Error('No active order found');
      }

      console.log('Generating receipt for order:', currentOrder._id);
      const response = await api.get(`orders/${currentOrder._id}/receipt`);
      console.log('Generated receipt:', response.data);
      return { success: true, receipt: response.data };
    } catch (err) {
      console.error('Error generating receipt:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate receipt';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`orders/${orderId}`, updates);
      console.log('Updated order:', response.data);
      if (currentOrder?._id === orderId) {
        setCurrentOrder(response.data);
      }
      return { success: true, order: response.data };
    } catch (err) {
      console.error('Error updating order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        loading,
        error,
        createOrder,
        joinOrder,
        generateReceipt,
        updateOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
