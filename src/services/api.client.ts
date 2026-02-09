import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh-session')) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await authService.refreshSession();

        if (response.success && response.data) {
          const { token, expiresAt } = response.data;

          // Update store safely
          const currentState = useAuthStore.getState();
          if (currentState.user && currentState.role) {
            useAuthStore.getState().login({
              token,
              newExpiresAt: expiresAt, // Corrected property name
              user: currentState.user,
              role: currentState.role,
              session: {
                id: 'refreshed-session', // We might not have full session object here, but minimal update is token
                token,
                expiresAt,
                userId: currentState.user.id
              } as any // Partial update might require casting if strict types
            });
          }

          api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
          originalRequest.headers['Authorization'] = 'Bearer ' + token;

          processQueue(null, token);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed');
        }

      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
