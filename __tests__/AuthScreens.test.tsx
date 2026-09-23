import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import LoginScreen from '../src/screens/auth/signIn/LoginScreen';
import Otp from '../src/screens/auth/otp/Otp';
import { TextInput } from 'react-native';
import { patientSignin, verifyPatientOtp } from '../src/network/api';
import {Provider} from 'react-redux';
import {createAppStore} from '../src/store';
import {session} from '../testUtils/auth';

// The first React Native render can include lazy module transforms on CI.
jest.setTimeout(15000);

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));
jest.mock('../src/network/api', () => ({
  patientSignin: jest.fn(), verifyPatientOtp: jest.fn(), verifyPatientPhone: jest.fn(),
}));
jest.mock('../src/utils/toast', () => ({ showToast: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: { phone: '9999999999' } }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('lucide-react-native', () => ({ Mail: () => null, Phone: () => null, Lock: () => null }));
jest.mock('../src/components/backHeader/BackHeader', () => () => null);
jest.mock('../src/components/divider/Divider', () => () => null);
jest.mock('../src/components/input/Input', () => ({
  Input: (props: object) => require('react').createElement('input', props),
}));
jest.mock('../src/components/customButton/CustomButton', () => (props: object) =>
  require('react').createElement('button', props));

let root: ReactTestRenderer;
let appStore = createAppStore();
beforeEach(() => {
  jest.clearAllMocks();
  appStore = createAppStore();
});
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

async function submitEmail() {
  await act(async () => { root = create(<Provider store={appStore}><LoginScreen /></Provider>); });
  await act(async () => {
    const inputs = root.root.findAllByType('input');
    inputs.find(node => node.props.label === 'Email Address')!.props.onChangeText('patient@example.com');
    inputs.find(node => node.props.label === 'Password')!.props.onChangeText('password');
  });
  await act(async () => {
    await root.root.findAllByType('button').find(node => node.props.title === 'Sign In')!.props.onPress();
  });
}

test.each([
  { success: true, accessToken: 'email-token', data: session.patient },
  { success: true, data: { ...session.patient, accessToken: 'email-token' } },
])('email success completes the session with a real token (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(appStore.getState().auth).toMatchObject({
    accessToken: 'email-token', patient: session.patient, isLoggedIn: true,
  });
});

test.each([
  { success: false }, { success: true },
  { success: true, accessToken: '   ' },
  { success: true, data: { accessToken: 'token-without-profile' } },
])('invalid email response stays signed out (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(appStore.getState().auth.isLoggedIn).toBe(false);
});

async function submitOtp() {
  await act(async () => { root = create(<Provider store={appStore}><Otp /></Provider>); });
  await act(async () => { root.root.findByType(TextInput).props.onChangeText('123456'); });
  await act(async () => {
    await root.root.findAllByType('button').find(node => node.props.title === 'Verify')!.props.onPress();
  });
}

test.each([
  [{ success: true, accessToken: 'otp-token', data: session.patient }, 'otp-token'],
  [{ success: true, data: { ...session.patient, accessToken: 'otp-token' } }, 'otp-token'],
])('verified OTP completes the session (%j)', async (response, token) => {
  (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
  await submitOtp();
  expect(appStore.getState().auth).toMatchObject({
    accessToken: token, patient: session.patient, isLoggedIn: true,
  });
});

test.each([
  { success: false }, { success: true, isValid: false },
  {success: true, isValid: true},
  {success: true, data: {accessToken: 'token-without-profile'}},
])(
  'invalid OTP stays signed out (%j)', async response => {
    (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
    await submitOtp();
    expect(appStore.getState().auth.isLoggedIn).toBe(false);
  },
);
