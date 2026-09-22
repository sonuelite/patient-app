import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from '../src/context/AppContext';
import StackNavigator from '../src/navigator/StackNavigator';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ name }: { name: string }) => {
      const ReactModule = require('react');
      return ReactModule.createElement('view', { name });
    },
  }),
}));
jest.mock('../src/screens/auth/signIn/LoginScreen', () => () => null);
jest.mock('../src/screens/auth/signup/Signup', () => () => null);
jest.mock('../src/screens/auth/otp/Otp', () => () => null);
jest.mock('../src/navigator/BottomTabNavigator', () => () => null);

let app: ReturnType<typeof useApp>;
let root: ReactTestRenderer;
let saved: Map<string, string>;
function Probe() { app = useApp(); return <StackNavigator />; }
async function mount() {
  await act(async () => { root = create(<AppProvider><Probe /></AppProvider>); });
}
function routes() {
  return root.root.findAll(node => node.type === 'view')
    .map(node => node.props.name);
}
beforeEach(() => {
  jest.resetAllMocks();
  saved = new Map();
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async key => saved.get(key) ?? null);
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => { saved.set(key, value); });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation(async key => { saved.delete(key); });
});
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

test.each([
  [undefined, undefined, false], [undefined, 'token', false],
  ['false', 'token', false], ['invalid', 'token', false],
  ['true', '', false], ['true', 'token', true], ['true', undefined, true],
])('restores only valid saved state (%s, %s)', async (status, token, expected) => {
  if (status !== undefined) { saved.set('is_logged_in', status); }
  if (token !== undefined) { saved.set('access_token', token); }
  await mount();
  expect(app.authLoading).toBe(false);
  expect(app.isLoggedIn).toBe(expected);
  expect(routes()).toEqual(expected ? ['PatientTabs'] : ['LoginScreen', 'Signup', 'Otp']);
});

test.each(['real-token', undefined])('persists login and logout across remounts (%s)', async token => {
  await mount();
  saved.set('access_token', 'stale-token');
  await act(async () => app.completeLogin(token));
  expect(routes()).toEqual(['PatientTabs']);
  expect(saved.get('is_logged_in')).toBe('true');
  expect(saved.get('access_token')).toBe(token);
  await act(async () => root.unmount());
  await mount();
  expect(app.isLoggedIn).toBe(true);
  expect(routes()).toEqual(['PatientTabs']);
  await act(async () => app.logout());
  expect(app.user).toBeNull();
  expect(app.isLoggedIn).toBe(false);
  expect(saved.size).toBe(0);
  expect(routes()).toEqual(['LoginScreen', 'Signup', 'Otp']);
  await act(async () => root.unmount());
  await mount();
  expect(app.isLoggedIn).toBe(false);
});

test('startup shows only the spinner until storage resolves', async () => {
  let resolve!: (value: string | null) => void;
  (AsyncStorage.getItem as jest.Mock).mockReturnValueOnce(new Promise(r => { resolve = r; }));
  await mount();
  expect(app.authLoading).toBe(true);
  expect(routes()).toEqual([]);
  expect(root.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  await act(async () => { resolve(null); });
  expect(app.authLoading).toBe(false);
  expect(root.root.findAllByType(ActivityIndicator)).toHaveLength(0);
});

test('failed storage reads finish startup signed out', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failed'));
  await mount();
  expect(app.authLoading).toBe(false);
  expect(app.isLoggedIn).toBe(false);
});

test('failed login writes never authenticate', async () => {
  await mount();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));
  await act(async () => { await expect(app.completeLogin('token')).rejects.toThrow('write failed'); });
  expect(app.isLoggedIn).toBe(false);
  expect(saved.has('is_logged_in')).toBe(false);
});

test('failed logout rejects so the screen can show an error', async () => {
  await mount();
  await act(async () => app.completeLogin('token'));
  (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('remove failed'));
  await act(async () => { await expect(app.logout()).rejects.toThrow('remove failed'); });
  expect(app.isLoggedIn).toBe(true);
});

test.each(['', '   '])('rejects blank tokens (%s)', async token => {
  await mount();
  await act(async () => { await expect(app.completeLogin(token)).rejects.toThrow('Invalid access token'); });
  expect(app.isLoggedIn).toBe(false);
  expect(saved.size).toBe(0);
});
