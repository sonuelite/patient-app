import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { store } from '../store';
import type { RootState } from '../store';

const API_BASE_URL = 'https://hims-api.zynotechnologies.com';

export function createApiClient(getState: () => RootState): AxiosInstance {
  const client = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });
  client.interceptors.request.use(config => {
    const { accessToken, selectedEntityId, isLoggedIn } = getState().auth;
    if (isLoggedIn && accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      config.headers.delete('Authorization');
    }
    if (isLoggedIn && selectedEntityId !== null) {
      config.headers.set('x-entity-id', selectedEntityId);
    } else {
      config.headers.delete('x-entity-id');
    }
    return config;
  });
  return client;
}

// Public authentication endpoints must not inherit a previous account's headers.
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});
export const apiClient = createApiClient(store.getState);
