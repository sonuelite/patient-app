import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import PatientHomeScreen from '../src/screens/patient/home/PatientHomeScreen';
import {getAllRelatedPatients} from '../src/network/api';

jest.mock('../src/network/api', () => ({getAllRelatedPatients: jest.fn()}));
jest.mock('../src/store/hooks', () => ({
  useAppSelector: (selector: Function) => selector({auth: {
    patient: {patient_id: 1, first_name: 'Primary', last_name: 'Patient', uhid: 'SELF', photo: null},
    accessToken: 'token',
  }}),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useFocusEffect: (callback: Function) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native-safe-area-context', () => ({useSafeAreaInsets: () => ({top: 0})}));
jest.mock('lucide-react-native', () => new Proxy({}, {get: () => () => null}));
jest.mock('../src/context/AppContext', () => ({
  useApp: () => {
    const [currentPatientId, setCurrentPatientId] = require('react').useState('1');
    return {
      currentPatientId, setCurrentPatientId,
      patients: [{id: 'unrelated-mock', bloodGroup: 'WRONG', vitals: [{bp: '999/999'}]}],
      appointments: [], prescriptions: [], labOrders: [], bills: [], notifications: [], medicationReminders: [],
    };
  },
}));

let root: ReactTestRenderer;
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });
const screenText = () => root.root.findAllByType(Text).map(node => node.props.children).flat().join('');

test('selecting a family member updates the header and never uses another patient’s mock vitals', async () => {
  jest.mocked(getAllRelatedPatients).mockResolvedValue([{
    patient_id: 2, uuid: 'child', first_name: 'Child', last_name: 'Patient',
    uhid: 'CHILD', photo: null, gender: 'Male', relation_of: 'Son',
    parent_patient_id: 1, is_main_patient: false, email: null, phone: null, status: 'Active',
  }]);
  await act(async () => { root = create(<PatientHomeScreen />); });
  expect(getAllRelatedPatients).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  expect(screenText()).toContain('Primary Patient');
  const toggle = () => root.root.findAllByType(TouchableOpacity).find(node => node.props.accessibilityLabel?.startsWith('Select patient'))!;
  act(() => toggle().props.onPress());
  const options = root.root.findAllByType(TouchableOpacity).filter(node => node.props.accessibilityState?.selected !== undefined);
  expect(options).toHaveLength(2);
  act(() => options[1].props.onPress());
  expect(screenText()).toContain('Child Patient');
  expect(screenText()).toContain('CHILD');
  expect(screenText()).not.toContain('999/999');
  expect(screenText()).not.toContain('WRONG');
  expect(toggle().props.accessibilityState.expanded).toBe(false);
});

test('a failed family request keeps the primary profile available and offers retry', async () => {
  jest.mocked(getAllRelatedPatients).mockRejectedValue(new Error('Network failed'));
  await act(async () => { root = create(<PatientHomeScreen />); });
  act(() => root.root.findAllByType(TouchableOpacity).find(node => node.props.accessibilityLabel?.startsWith('Select patient'))!.props.onPress());
  expect(screenText()).toContain('Network failed');
  expect(screenText()).toContain('Retry');
  expect(screenText()).toContain('Primary Patient');
});
