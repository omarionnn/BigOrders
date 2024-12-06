import React, { createContext, useContext, useState } from 'react';
import api from '../config/axios';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create order
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate input data
      if (!orderData.restaurantId || !orderData.name) {
        throw new Error('Restaurant and order name are required');
      }

      console.log('Creating order with data:', {
        restaurantId: orderData.restaurantId,
        name: orderData.name
      });

      const response = await api.post('/api/orders', {
        restaurantId: orderData.restaurantId,
        name: orderData.name
      });

      console.log('Create order response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create order');
      }

      const newOrder = response.data.order;
      setCurrentOrder(newOrder);
      
      // Fetch and set the restaurant data
      try {
        const restaurantResponse = await api.get(`/api/restaurants/${orderData.restaurantId}`);
        if (restaurantResponse.data.success) {
          setSelectedRestaurant(restaurantResponse.data.restaurant);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
      }
      
      console.log('New order created:', newOrder);

      return { success: true, order: newOrder };
    } catch (err) {
      console.error('Error creating order:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Join order
  const joinOrder = async (pin) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting to join order with PIN:', pin);

      const response = await api.post('/api/orders/join', { pin });
      console.log('Join order response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to join order');
      }

      const joinedOrder = response.data.order;
      setCurrentOrder(joinedOrder);

      // Fetch and set the restaurant data
      try {
        const restaurantResponse = await api.get(`/api/restaurants/${joinedOrder.restaurantId}`);
        if (restaurantResponse.data.success) {
          setSelectedRestaurant(restaurantResponse.data.restaurant);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
      }

      console.log('Successfully joined order:', joinedOrder);

      return { success: true, order: joinedOrder };
    } catch (err) {
      console.error('Error joining order:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      const errorMessage = err.response?.data?.message || err.message || 'Failed to join order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get current order
  const getCurrentOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching current order...');

      if (!currentOrder?._id) {
        console.log('No current order found in state');
        return { success: false, error: 'No active order' };
      }

      const response = await api.get(`/api/orders/${currentOrder._id}`);
      console.log('Get current order response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch order');
      }

      const updatedOrder = response.data.order;
      setCurrentOrder(updatedOrder);

      // Ensure restaurant data is in sync
      try {
        const restaurantResponse = await api.get(`/api/restaurants/${updatedOrder.restaurantId}`);
        if (restaurantResponse.data.success) {
          setSelectedRestaurant(restaurantResponse.data.restaurant);
        }
      } catch (err) {
        console.error('Error fetching restaurant:', err);
      }

      console.log('Current order updated:', updatedOrder);

      return { success: true, order: updatedOrder };
    } catch (err) {
      console.error('Error fetching current order:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateReceipt = async () => {
    try {
      console.log('\n=== GENERATE RECEIPT DEBUG (OrderContext) ===');
      
      if (!currentOrder?._id) {
        console.error('No current order found');
        throw new Error('Order not found. Please make sure you have joined or created an order.');
      }

      console.log('1. Current order:', {
        id: currentOrder._id,
        name: currentOrder.name,
        status: currentOrder.status,
        creator: currentOrder.creator?.name,
        participantCount: currentOrder.participants?.length
      });
      
      // Generate the receipt
      console.log('2. Generating receipt...');
      const response = await api.get(`/api/orders/${currentOrder._id}/receipt`);
      console.log('3. Receipt response:', {
        success: response.data.success,
        orderName: response.data.receipt?.order?.name,
        participantCount: response.data.receipt?.participants?.length,
        participants: response.data.receipt?.participants?.map(p => ({
          name: p.user?.name,
          role: p.role,
          itemCount: p.items?.length,
          total: p.total
        }))
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to generate receipt');
      }

      // Validate receipt data
      const receipt = response.data.receipt;
      console.log('4. Processing receipt data:', {
        orderDetails: receipt.order,
        restaurantInfo: receipt.restaurant,
        participantCount: receipt.participants?.length,
        summary: receipt.summary
      });

      if (!receipt.participants || !Array.isArray(receipt.participants)) {
        console.error('Invalid receipt data - missing or invalid participants:', receipt);
        throw new Error('Invalid receipt data structure');
      }

      // Log participant details
      receipt.participants.forEach((participant, index) => {
        console.log(`5. Participant ${index + 1}:`, {
          name: participant.user?.name,
          role: participant.role,
          itemCount: participant.items?.length,
          total: participant.total
        });
      });

      return { success: true, receipt };
    } catch (error) {
      console.error('Receipt generation error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to generate receipt'
      };
    }
  };

  const updateOrder = async (orderId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.put(`/api/orders/${orderId}`, updates);
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
        selectedRestaurant,
        loading,
        error,
        createOrder,
        joinOrder,
        getCurrentOrder,
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
