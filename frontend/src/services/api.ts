import axios from 'axios';
import { ApiResponse, PaginatedResponse, Category, Product, Cart, CartItem, Order, PaymentData } from '../types';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const categoryService = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
  getById: (id: number) => api.get<ApiResponse<Category>>(`/categories/${id}`),
};

export const productService = {
  getAll: (params?: {
    category_id?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }) => api.get<ApiResponse<PaginatedResponse<Product>>>('/products', { params }),
  
  getFeatured: () => api.get<ApiResponse<Product[]>>('/products/featured'),
  
  getById: (id: number) => api.get<ApiResponse<Product>>(`/products/${id}`),
};

export const cartService = {
  get: () => api.get<ApiResponse<Cart>>('/cart'),
  
  add: (productId: number, quantity: number) => 
    api.post<ApiResponse<CartItem>>('/cart', { product_id: productId, quantity }),
  
  update: (itemId: number, quantity: number) => 
    api.put<ApiResponse<CartItem>>(`/cart/${itemId}`, { quantity }),
  
  remove: (itemId: number) => 
    api.delete<ApiResponse<void>>(`/cart/${itemId}`),
  
  clear: () => api.delete<ApiResponse<void>>('/cart'),
};

export const orderService = {
  create: (paymentData: PaymentData) => 
    api.post<ApiResponse<{ order: Order; payment: any }>>('/orders', paymentData),
  
  getById: (id: number) => api.get<ApiResponse<Order>>(`/orders/${id}`),
};

export default api;