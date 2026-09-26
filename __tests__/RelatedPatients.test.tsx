import React from 'react';
import {Text} from 'react-native';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import {Provider} from 'react-redux';
import {createAppStore} from '../src/store';
import {completeLogin} from '../src/store/authSlice';
import {session} from '../testUtils/auth';
import {getPatientDetails, getAllRelatedPatients} from '../src/network/api';
import type {RelatedPatient} from '../src/network/api';
import FamilyMembersScreen from '../src/screens/patient/profile/familyMembers/FamilyMembers';

const mockNavigate = jest.fn();
import CustomButton from '../src/components/customButton/CustomButton';
import {showToast} from '../src/utils/toast';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null), setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));
jest.mock('../src/network/api', () => ({getPatientDetails: jest.fn(), getAllRelatedPatients: jest.fn(), addFamilyMember: jest.fn()}));
jest.mock('../src/context/AppContext', () => ({
  useApp: () => ({currentPatientId: '', setCurrentPatientId: jest.fn(), showToast: jest.fn()}),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({goBack: jest.fn(), navigate: mockNavigate}),
  useFocusEffect: (callback: () => (() => void)) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
}));
jest.mock('react-native-toast-message', () => () => null);
jest.mock('../src/utils/toast', () => ({showToast: jest.fn()}));
jest.mock('lucide-react-native', () => ({Plus: () => null, Users: () => null, Repeat: () => null}));
jest.mock('../src/components/ui/Card', () => ({
  Card: ({children}: {children: React.ReactNode}) => children,
  Badge: () => null,
  EmptyState: (props: object) => require('react').createElement('empty-state', props),
}));
jest.mock('../src/components/ui/DataDisplay', () => ({Avatar: () => null}));
jest.mock('../src/components/screenHeader/ScreenHeader', () => ({ScreenHeader: () => null}));
jest.mock('../src/components/ui/Feedback', () => ({BottomSheet: () => null}));
jest.mock('../src/components/customButton/CustomButton', () => () => null);

const primary: RelatedPatient = {
  patient_id: session.patient.patient_id, uuid: 'primary', uhid: 'PRIMARY-UHID',
  first_name: 'Primary', last_name: 'Patient', relation_of: 'Self',
  gender: 'Male', photo: null, parent_patient_id: null, is_main_patient: true,
  email: null, phone: null, status: 'Active',
};
const child: RelatedPatient = {
  ...primary, patient_id: 62, uuid: 'child', uhid: 'CHILD-UHID',
  first_name: 'Child', relation_of: 'son', parent_patient_id: primary.patient_id,
  is_main_patient: false,
};
let root: ReactTestRenderer;
async function renderScreen() {
  const appStore = createAppStore();
  await appStore.dispatch(completeLogin(session)).unwrap();
  await act(async () => { root = create(<Provider store={appStore}><FamilyMembersScreen /></Provider>); });
  return root.root.findAllByType(Text).map(node => node.props.children).flat().join('');
}
beforeEach(() => { jest.clearAllMocks(); });
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

test('Self is Primary even when not first, and only other relations count as family', async () => {
  jest.mocked(getAllRelatedPatients).mockResolvedValue([child, primary]);
  const text = await renderScreen();
  expect(getAllRelatedPatients).toHaveBeenCalledWith(session.patient.patient_id, expect.any(AbortSignal));
  expect(text).toContain('PRIMARY-UHID · Primary');
  expect(text).toContain('Family Members (1)');
  expect(text).toContain('Child Patient');
  expect(text).toContain('son');
});

test('Self-only response shows an empty family list', async () => {
  jest.mocked(getAllRelatedPatients).mockResolvedValue([primary]);
  const text = await renderScreen();
  expect(text).toContain('Family Members (0)');
  expect(root.root.find(node => typeof node.type === 'string' && node.props.title === 'No family members')).toBeDefined();
});

test('a failed request shows retry instead of the no-family message', async () => {
  jest.mocked(getAllRelatedPatients).mockRejectedValue(new Error('Network failed'));
  await renderScreen();
  const empty = root.root.find(node => typeof node.type === 'string' && node.props.title === 'Unable to load family members');
  expect(empty.props.message).toBe('Network failed');
  expect(empty.props.action.label).toBe('Retry');
});


test('Add Patient waits for the authenticated patient details before navigating', async () => {
  jest.mocked(getAllRelatedPatients).mockResolvedValue([primary]);
  let resolve!: (value: typeof primary) => void;
  jest.mocked(getPatientDetails).mockReturnValue(new Promise(done => { resolve = done; }));
  await renderScreen();
  const button = () => root.root.findAllByType(CustomButton).find(node => node.props.title === 'Add Patient' || node.props.title === 'Loading patient...')!;
  let request: Promise<void>;
  act(() => { request = button().props.onPress() as unknown as Promise<void>; });
  expect(button().props.disable).toBe(true);
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(getPatientDetails).toHaveBeenCalledWith(session.patient.patient_id, expect.any(AbortSignal));
  await act(async () => { resolve(primary); await request; });
  expect(mockNavigate).toHaveBeenCalledWith('AddPatient', {patientDetails: primary});
});

test('Add Patient displays the request error without navigating', async () => {
  jest.mocked(getAllRelatedPatients).mockResolvedValue([primary]);
  jest.mocked(getPatientDetails).mockRejectedValue(new Error('Patient unavailable'));
  await renderScreen();
  await act(async () => { await root.root.findAllByType(CustomButton).find(node => node.props.title === 'Add Patient')!.props.onPress(); });
  expect(showToast).toHaveBeenCalledWith('Patient unavailable', 'error');
  expect(mockNavigate).not.toHaveBeenCalled();
});
