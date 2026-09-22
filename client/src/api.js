import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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
