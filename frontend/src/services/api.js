import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject Token Auth header if user is logged in
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem('the_k_luxury_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.token) {
          config.headers.Authorization = `Token ${user.token}`;
        }
      } catch (e) {
        console.error('Error parsing token', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getItems = () => api.get('/items/');
export const getDeletedItems = () => api.get('/items/?trash=true');
export const createItem = (data) => api.post('/items/', data);
export const updateItem = (id, data) => api.put(`/items/${id}/`, data);
export const deleteItem = (id) => api.delete(`/items/${id}/`);
export const restoreItem = (id) => api.post(`/items/${id}/restore/`);
export const forceDeleteItem = (id) => api.delete(`/items/${id}/force_delete/`);
export const uploadImage = (formData) => api.post('/upload/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getCategories = () => api.get('/categories/');
export const getDeletedCategories = () => api.get('/categories/?trash=true');
export const createCategory = (data) => api.post('/categories/', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}/`);
export const restoreCategory = (id) => api.post(`/categories/${id}/restore/`);
export const forceDeleteCategory = (id) => api.delete(`/categories/${id}/force_delete/`);

export const getUsers = () => api.get('/users/');
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.put(`/users/${id}/`, data);
export const deleteUser = (id) => api.delete(`/users/${id}/`);

export const getRoles = () => api.get('/roles/');
export const createRole = (data) => api.post('/roles/', data);
export const updateRole = (id, data) => api.put(`/roles/${id}/`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}/`);
export const getPermissions = () => api.get('/permissions/');

export const forgotPassword = (email) => api.post('/auth/forgot-password/', { email });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password/', { email, otp, new_password: newPassword });

export const loginUser = (email, password) => api.post('/auth/login/', { email, password });
export const registerUser = (name, email, password) => api.post('/auth/register/', { name, email, password });

export const getFavorites = () => api.get('/favorites/');
export const toggleFavoriteApi = (itemId) => api.post('/favorites/toggle/', { item_id: itemId });

export const getInventoryLogs = () => api.get('/inventory/');
export const createInventoryAdjustment = (data) => api.post('/inventory/', data);

export const getOrders = () => api.get('/orders/');
export const createOrder = (data) => api.post('/orders/', data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}/`);
export const verifyMomoPayment = (data) => api.post('/orders/verify-momo/', data);
export const getFashionNews = () => api.get('/news/');

export default api;