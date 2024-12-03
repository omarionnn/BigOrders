import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('auth/register', userData),
  login: (credentials) => api.post('auth/login', credentials),
  logout: () => api.post('auth/logout'),
  getMe: () => api.get('auth/me'),
};

export const orderAPI = {
  createOrder: (restaurantId, name) => 
    api.post('orders', { restaurantId, name })
      .then(response => ({
        success: true,
        order: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to create order'
      })),
  joinOrder: (orderId, items) => 
    api.post('orders/join', { orderId, items })
      .then(response => ({
        success: true,
        data: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to join order'
      })),
  getOrder: (orderId) => 
    api.get(`orders/${orderId}`)
      .then(response => ({
        success: true,
        order: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to get order'
      })),
  updateOrderItems: (orderId, items) => 
    api.put(`orders/${orderId}/items`, { items })
      .then(response => ({
        success: true,
        data: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to update items'
      })),
  generateReceipt: (orderId) => 
    api.get(`orders/${orderId}/receipt`)
      .then(response => ({
        success: true,
        receipt: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to generate receipt'
      })),
  getUserOrders: () => 
    api.get('orders/user/orders')
      .then(response => ({
        success: true,
        orders: response.data
      }))
      .catch(error => ({
        success: false,
        error: error.response?.data?.message || 'Failed to get user orders'
      }))
};

export const restaurantAPI = {
  getRestaurants: () => api.get('restaurants'),
  getRestaurant: (id) => api.get(`restaurants/${id}`),
  getMenu: (id) => api.get(`restaurants/${id}/menu`),
};

export default api;
