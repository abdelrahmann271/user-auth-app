import axios, { AxiosError } from 'axios';

const API_VERSION = 'v1';
const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_URL = `${API_BASE}/${API_VERSION}`;

export const TOKEN_EXPIRED_EVENT = 'auth:token-expired';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/signin') || requestUrl.includes('/auth/signup');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent(TOKEN_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);
