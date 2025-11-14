import axios, { AxiosError } from 'axios';
import { eventBus } from './EventBus';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  timeout: 10_000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        eventBus.emit('auth:unauthorized', { status });
      }

      if (status === 403) {
        eventBus.emit('auth:forbidden', { status });
      }
    }

    return Promise.reject(error);
  },
);
