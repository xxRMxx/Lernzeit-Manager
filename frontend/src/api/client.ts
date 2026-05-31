import axios from 'axios';
import { useAuthStore } from '../store/auth';

// Liest die URL aus Coolify aus. Wenn sie nicht existiert, nutzt er die relative '/api'
const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor zum automatischen Hinzufügen des Tokens
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default client;
