import axios from 'axios';

// Liest die URL aus Coolify aus. Wenn sie nicht existiert, nutzt er die relative '/api'
const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

export default client;
