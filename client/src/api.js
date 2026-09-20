import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('streamhub_user'));
    if (user?.sessionToken) config.headers['x-session-token'] = user.sessionToken;
  } catch { /* A request without a saved session will receive the normal API error. */ }
  return config;
});

export default api;
