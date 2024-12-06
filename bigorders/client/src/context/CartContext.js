import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useOrder } from './OrderContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const { currentOrder } = useOrder();
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item, quantity = 1, specialInstructions = '') => {
    console.log('CartContext: Adding to cart:', {
      item,
      quantity,
      specialInstructions,
      itemDetails: {
        name: item.name,
        price: item.price,
        priceType: typeof item.price
      }
    });

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem.item._id === item._id
      );

      if (existingItem) {
        console.log('CartContext: Updating existing item:', {
          existingItem,
          newQuantity: existingItem.quantity + quantity
        });

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

      const newItem = {
        item,
        quantity,
        specialInstructions,
        userId: user?.id,
        orderSession: currentOrder?.id,
        addedAt: new Date().toISOString(),
      };

      console.log('CartContext: Adding new item:', newItem);
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (itemId) => {
    console.log('CartContext: Removing from cart:', { itemId });
    setCartItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.item._id !== itemId)
    );
  };

  const updateQuantity = (itemId, quantity) => {
    console.log('CartContext: Updating quantity:', { itemId, quantity });
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
    console.log('CartContext: Updating special instructions:', { itemId, instructions });
    setCartItems((prevItems) =>
      prevItems.map((cartItem) =>
        cartItem.item._id === itemId
          ? { ...cartItem, specialInstructions: instructions }
          : cartItem
      )
    );
  };

  const clearCart = () => {
    console.log('CartContext: Clearing cart');
    setCartItems([]);
  };

  const getCartTotal = () => {
    console.log('CartContext: Calculating cart total');
    return cartItems.reduce(
      (total, { item, quantity }) => total + item.price * quantity,
      0
    );
  };

  const getItemCount = () => {
    console.log('CartContext: Calculating item count');
    return cartItems.reduce((total, { quantity }) => total + quantity, 0);
  };

  const getUserItems = (userId) => {
    console.log('CartContext: Getting user items:', { userId });
    return cartItems.filter((item) => item.userId === userId);
  };

  const getOrderItems = (orderSessionId) => {
    console.log('CartContext: Getting order items:', { orderSessionId });
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
