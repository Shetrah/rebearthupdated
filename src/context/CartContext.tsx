import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from database when user changes
  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart to database whenever it changes
  useEffect(() => {
    if (user && cartItems.length >= 0) {
      saveCartToDatabase();
    }
  }, [cartItems, user]);

  const loadCartFromDatabase = async () => {
    if (!user) return;

    try {
      // For now, we'll use localStorage as a simple solution
      // In a real app, you'd store cart data in your database
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const saveCartToDatabase = async () => {
    if (!user) return;

    try {
      // For now, we'll use localStorage as a simple solution
      // In a real app, you'd store cart data in your database
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};