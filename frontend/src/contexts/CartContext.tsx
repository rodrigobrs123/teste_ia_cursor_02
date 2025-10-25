import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cart, CartItem } from '../types';
import { cartService } from '../services/api';
import api from '../services/api';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<any>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    try {
      setLoading(true);
      
      // Initialize session first by making a simple request
      try {
        const csrfResponse = await api.get('/csrf-token');
        console.log('CSRF token initialized:', csrfResponse.data);
      } catch (csrfError) {
        console.warn('CSRF token request failed, continuing anyway:', csrfError);
      }
      
      const response = await cartService.get();
      console.log('Cart response:', response.data);
      
      if (response.data.success) {
        setCart(response.data.data);
        console.log('Cart loaded successfully:', response.data.data);
      } else {
        console.error('Cart API returned error:', response.data.message);
        setCart({ items: [], total: 0, count: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      
      // Log detailed error information
      console.error('Cart error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Initialize empty cart if there's an error
      setCart({ items: [], total: 0, count: 0 });
      
      // Log the specific error for debugging
      if (error.response?.status === 401) {
        console.warn('Cart: Authentication required');
      } else if (error.response?.status === 500) {
        console.error('Cart: Server error - check backend logs');
      } else if (error.response?.status === 400) {
        console.warn('Cart: Bad request - session may not be initialized');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      
      // Initialize session first
      try {
        await api.get('/csrf-token');
      } catch (csrfError) {
        console.warn('CSRF token request failed, continuing anyway:', csrfError);
      }
      
      const response = await cartService.add(productId, quantity);
      
      if (response.data.success) {
        await refreshCart();
        return response.data;
      } else {
        throw new Error(response.data.message || 'Erro ao adicionar produto ao carrinho');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Erro ao adicionar produto ao carrinho';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        // Bad request - usually validation or stock issues
        errorMessage = error.response.data?.message || 'Produto indisponível ou dados inválidos';
      } else if (error.response?.status === 404) {
        errorMessage = 'Produto não encontrado';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente.';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      await cartService.update(itemId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setLoading(true);
      await cartService.remove(itemId);
      await refreshCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clear();
      setCart({ items: [], total: 0, count: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};