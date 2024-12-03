import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useOrder } from './OrderContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentOrder } = useOrder();
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, quantity = 1, specialInstructions = '') => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.item._id === item._id
      );

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.item._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                specialInstructions:
                  specialInstructions || cartItem.specialInstructions,
              }
            : cartItem
        );
      }

      return [
        ...prevItems,
        {
          item,
          quantity,
          specialInstructions,
          userId: user?.id,
          orderSession: currentOrder?.id,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.item._id !== itemId)
    );
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.item._id === itemId
          ? { ...cartItem, quantity }
          : cartItem
      )
    );
  };

  const updateSpecialInstructions = (itemId, instructions) => {
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.item._id === itemId
          ? { ...cartItem, specialInstructions: instructions }
          : cartItem
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, { item, quantity }) => total + item.price * quantity,
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((total, { quantity }) => total + quantity, 0);
  };

  const getUserItems = (userId) => {
    return cartItems.filter((item) => item.userId === userId);
  };

  const getOrderItems = (orderSessionId) => {
    return cartItems.filter((item) => item.orderSession === orderSessionId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateSpecialInstructions,
        clearCart,
        getCartTotal,
        getItemCount,
        getUserItems,
        getOrderItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
