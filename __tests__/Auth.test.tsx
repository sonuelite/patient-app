import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Provider } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppStore } from '../src/store';
import {
  completeLogin,
  logout,
  restoreAuth,
  selectEntity,
} from '../src/store/authSlice';
import { selectPatientId } from '../src/store/selectors';
import { SESSION_KEY } from '../src/utils/sessionStorage';
import { session } from '../testUtils/auth';
import StackNavigator from '../src/navigator/StackNavigator';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('../src/utils/toast', () => ({ showToast: jest.fn() }));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ name }: { name: string }) =>
      require('react').createElement('view', { name }),
  }),
}));
jest.mock('../src/screens/auth/signIn/LoginScreen', () => () => null);
jest.mock('../src/screens/auth/signup/Signup', () => () => null);
jest.mock('../src/screens/auth/otp/Otp', () => () => null);
jest.mock('../src/navigator/BottomTabNavigator', () => () => null);
jest.mock(
  '../src/screens/patient/profile/familyMembers/FamilyMembers',
  () => () => null,
);

let saved: Map<string, string>;
beforeEach(() => {
  jest.resetAllMocks();
  saved = new Map();
  jest
    .mocked(AsyncStorage.getItem)
    .mockImplementation(async key => saved.get(key) ?? null);
  jest.mocked(AsyncStorage.setItem).mockImplementation(async (key, value) => {
    saved.set(key, value);
  });
  jest.mocked(AsyncStorage.removeItem).mockImplementation(async key => {
    saved.delete(key);
  });
});

test('persists and restores the token, every patient field, and selected entity', async () => {
  const first = createAppStore();
  await first.dispatch(completeLogin(session)).unwrap();
  expect(first.getState().auth.accessToken).toBe(session.accessToken);
  expect(JSON.parse(saved.get(SESSION_KEY)!)).toEqual(session);
  const restored = createAppStore();
  await restored.dispatch(restoreAuth()).unwrap();
  expect(restored.getState().auth).toMatchObject({
    ...session,
    isLoggedIn: true,
    hydrated: true,
  });
  expect(selectPatientId(restored.getState())).toBe(session.patient.patient_id);
});

test('entity changes persist and cannot select an entity outside the patient list', async () => {
  const appStore = createAppStore();
  await appStore.dispatch(completeLogin(session)).unwrap();
  await appStore.dispatch(selectEntity('hospital-b')).unwrap();
  expect(appStore.getState().auth.selectedEntityId).toBe('hospital-b');
  expect(JSON.parse(saved.get(SESSION_KEY)!).selectedEntityId).toBe(
    'hospital-b',
  );
  await expect(
    appStore.dispatch(selectEntity('unavailable')).unwrap(),
  ).rejects.toBeDefined();
  expect(appStore.getState().auth.selectedEntityId).toBe('hospital-b');
});

test('logout clears auth state and persisted auth, preserving unrelated storage', async () => {
  const appStore = createAppStore();
  await appStore.dispatch(completeLogin(session)).unwrap();
  saved.set('theme', 'dark');
  await appStore.dispatch(logout()).unwrap();
  expect(appStore.getState().auth).toMatchObject({
    accessToken: null,
    patient: null,
    selectedEntityId: null,
    isLoggedIn: false,
  });
  expect(saved).toEqual(new Map([['theme', 'dark']]));
  const restored = createAppStore();
  await restored.dispatch(restoreAuth()).unwrap();
  expect(restored.getState().auth.isLoggedIn).toBe(false);
});

test.each([
  'invalid-json',
  '{}',
  JSON.stringify({ ...session, accessToken: '' }),
])('malformed saved sessions finish startup signed out', async stored => {
  saved.set(SESSION_KEY, stored);
  const appStore = createAppStore();
  await appStore.dispatch(restoreAuth());
  expect(appStore.getState().auth).toMatchObject({
    hydrated: true,
    isLoggedIn: false,
  });
  expect(saved.has(SESSION_KEY)).toBe(false);
});

test('failed reads finish startup; failed writes never authenticate', async () => {
  const appStore = createAppStore();
  jest
    .mocked(AsyncStorage.getItem)
    .mockRejectedValueOnce(new Error('read failed'));
  await appStore.dispatch(restoreAuth());
  expect(appStore.getState().auth.hydrated).toBe(true);
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('write failed'));
  await expect(appStore.dispatch(completeLogin(session)).unwrap()).rejects.toBe(
    'write failed',
  );
  expect(appStore.getState().auth.isLoggedIn).toBe(false);
});

test('failed entity writes preserve the previous runtime entity', async () => {
  const appStore = createAppStore();
  await appStore.dispatch(completeLogin(session)).unwrap();
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('write failed'));
  await appStore.dispatch(selectEntity('hospital-b'));
  expect(appStore.getState().auth.selectedEntityId).toBe(
    session.selectedEntityId,
  );
});

test('failed logout remains retryable', async () => {
  const appStore = createAppStore();
  await appStore.dispatch(completeLogin(session)).unwrap();
  jest
    .mocked(AsyncStorage.removeItem)
    .mockRejectedValueOnce(new Error('remove failed'));
  await expect(appStore.dispatch(logout()).unwrap()).rejects.toBe(
    'remove failed',
  );
  expect(appStore.getState().auth.isLoggedIn).toBe(true);
  await appStore.dispatch(logout()).unwrap();
  expect(appStore.getState().auth.isLoggedIn).toBe(false);
});

test('navigation waits for restoration and uses Redux login/logout', async () => {
  const appStore = createAppStore();
  let resolveRead!: (value: string | null) => void;
  jest.mocked(AsyncStorage.getItem).mockReturnValueOnce(
    new Promise(resolve => {
      resolveRead = resolve;
    }),
  );
  let root!: ReactTestRenderer;
  await act(async () => {
    root = create(
      <Provider store={appStore}>
        <StackNavigator />
      </Provider>,
    );
  });
  expect(root.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  await act(async () => {
    resolveRead(JSON.stringify(session));
  });
  const routes = () =>
    root.root
      .findAll(node => node.type === 'view')
      .map(node => node.props.name);
  expect(routes()).toEqual(['PatientTabs', 'FamilyMembers']);
  await act(async () => {
    await appStore.dispatch(logout()).unwrap();
  });
  expect(routes()).toEqual(['LoginScreen', 'Signup', 'Otp']);
  await act(async () => root.unmount());
});
