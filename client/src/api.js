import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_URL) {
  throw new Error('VITE_API_URL is required in production.');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  try {
    // Attach group member session token
    const savedUser = localStorage.getItem('streamhub_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user?.sessionToken) {
        config.headers['x-session-token'] = user.sessionToken;
      }
    }

    // Attach user account auth token
    const savedAccount = localStorage.getItem('streamhub_account');
    if (savedAccount) {
      const account = JSON.parse(savedAccount);
      if (account?.token) {
        config.headers['Authorization'] = `Bearer ${account.token}`;
        config.headers['x-auth-token'] = account.token;
      }
    }
  } catch {
    /* If local storage is invalid, requests continue normally */
  }
  return config;
});

export default api;
