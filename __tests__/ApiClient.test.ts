import { AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { createApiClient, publicClient } from '../src/network/client';
import { createAppStore } from '../src/store';
import { completeLogin, logout, selectEntity } from '../src/store/authSlice';
import { session } from '../testUtils/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

test('requests use the latest Redux token and selected entity, then clear headers on logout', async () => {
  const appStore = createAppStore();
  const client = createApiClient(appStore.getState);
  let headers = new AxiosHeaders();
  client.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    headers = config.headers;
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  await appStore.dispatch(completeLogin(session)).unwrap();
  await client.get('/test');
  expect(headers.get('Authorization')).toBe(`Bearer ${session.accessToken}`);
  expect(headers.get('x-entity-id')).toBe('hospital-a');
  await appStore.dispatch(selectEntity('hospital-b')).unwrap();
  await client.get('/test');
  expect(headers.get('x-entity-id')).toBe('hospital-b');
  await appStore.dispatch(logout()).unwrap();
  await client.get('/test', {
    headers: { Authorization: 'stale', 'x-entity-id': 'stale' },
  });
  expect(headers.has('Authorization')).toBe(false);
  expect(headers.has('x-entity-id')).toBe(false);
});

test('public endpoints do not attach session headers', async () => {
  const response = await publicClient.get('/test', {
    adapter: async config => {
      expect(config.headers.has('Authorization')).toBe(false);
      expect(config.headers.has('x-entity-id')).toBe(false);
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    },
  });
  expect(response.status).toBe(200);
});
