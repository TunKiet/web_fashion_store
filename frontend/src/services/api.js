import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getItems = () => api.get('/items/');
export const createItem = (data) => api.post('/items/', data);
export const updateItem = (id, data) => api.put(`/items/${id}/`, data);
export const deleteItem = (id) => api.delete(`/items/${id}/`);

export const getCategories = () => api.get('/categories/');
export const createCategory = (data) => api.post('/categories/', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}/`);

export const forgotPassword = (email) => api.post('/auth/forgot-password/', { email });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password/', { email, otp, new_password: newPassword });

export const loginUser = (email, password) => api.post('/auth/login/', { email, password });
export const registerUser = (name, email, password) => api.post('/auth/register/', { name, email, password });

export default api;