import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import LoginScreen from '../src/screens/auth/signIn/LoginScreen';
import Otp from '../src/screens/auth/otp/Otp';
import { TextInput } from 'react-native';
import { patientSignin, verifyPatientOtp } from '../src/network/api';
import { useApp } from '../src/context/AppContext';

// The first React Native render can include lazy module transforms on CI.
jest.setTimeout(15000);

jest.mock('../src/context/AppContext', () => ({ useApp: jest.fn() }));
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
const completeLogin = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  completeLogin.mockResolvedValue(undefined);
  (useApp as jest.Mock).mockReturnValue({ completeLogin });
});
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

async function submitEmail() {
  await act(async () => { root = create(<LoginScreen />); });
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
  { success: true, accessToken: 'email-token' },
  { success: true, data: { accessToken: 'email-token' } },
])('email success completes the session with a real token (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(completeLogin).toHaveBeenCalledWith('email-token');
});

test.each([
  { success: false }, { success: true },
  { success: true, accessToken: '   ' },
])('invalid email response stays signed out (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(completeLogin).not.toHaveBeenCalled();
});

async function submitOtp() {
  await act(async () => { root = create(<Otp />); });
  await act(async () => { root.root.findByType(TextInput).props.onChangeText('123456'); });
  await act(async () => {
    await root.root.findAllByType('button').find(node => node.props.title === 'Verify')!.props.onPress();
  });
}

test.each([
  [{ success: true, accessToken: 'otp-token' }, 'otp-token'],
  [{ success: true, data: { accessToken: 'otp-token' } }, 'otp-token'],
  [{ success: true, isValid: true }, undefined],
])('verified OTP completes the session (%j)', async (response, token) => {
  (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
  await submitOtp();
  expect(completeLogin).toHaveBeenCalledWith(token);
});

test.each([{ success: false }, { success: true, isValid: false }])(
  'invalid OTP stays signed out (%j)', async response => {
    (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
    await submitOtp();
    expect(completeLogin).not.toHaveBeenCalled();
  },
);
