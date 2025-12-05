import axios, { AxiosError } from 'axios';
import { eventBus } from '../events/EventBus';
import { client } from '@/api/openapi-client/client.gen';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  withCredentials: true,
  timeout: 10_000,
});

api.interceptors.request.use(
  (config) => {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log('[OpenAPI Request URL]:', url);
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
client.setConfig({
  axios: api,
});

export { client };
