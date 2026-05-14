// src/api/axiosConfig.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,  // nếu dùng cookie/session
  headers: {
    'Content-Type': 'application/json',
  }
})

export default api