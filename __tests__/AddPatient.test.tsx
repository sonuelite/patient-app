import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/types';
import AddPatient from '../src/screens/patient/profile/familyMembers/AddPatient';
import { mapPatientForm } from '../src/utils/patientForm';
import {addFamilyMember, editFamilyMember, getStatesByCountryId} from '../src/network/api';
jest.mock('../src/network/api', () => ({
  getAllActiveCountry: jest.fn(async () => [{countryss_id: 101, countryss_name: 'India'}]),
  getStatesByCountryId: jest.fn(async () => [{id: '10', name: 'Delhi'}]),
  getCityByStateId: jest.fn(async () => []),
  editFamilyMember: jest.fn(async () => ({success: true})),
  addFamilyMember: jest.fn(async () => ({success: true})),
}));

jest.mock('../src/context/AppContext', () => ({
  useApp: () => ({ showToast: jest.fn() }),
}));
jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(),
  types: { pdf: 'pdf' },
}));
jest.mock('lucide-react-native', () => ({
  FileUp: () => null,
  FileText: () => null,
}));
jest.mock('../src/components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/components/screenHeader/ScreenHeader', () => ({
  ScreenHeader: () => null,
}));
jest.mock('../src/components/customButton/CustomButton', () => (props: object) => require('react').createElement('submit', props));
jest.mock('../src/components/ui/Button', () => ({ Button: () => null }));
jest.mock(
  '../src/components/customDropdown/CustomDropdown',
  () => (props: object) => require('react').createElement('dropdown', props),
);
jest.mock('../src/components/input/Input', () => ({
  Input: (props: object) => require('react').createElement('input', props),
  Chip: () => null,
}));

test('normalizes optional values, dates, dropdowns and supported address/billing fields', () => {
  expect(
    mapPatientForm({
      first_name: ' null ',
      last_name: null,
      email: 'undefined',
      date_of_birth: '1990-05-12T00:00:00.000Z',
      gender: 'FEMALE',
      title: 'mrs.',
      phone: '9876543210',
      country_name: 'India',
      state_id: 12,
      pincode: 123456,
      panel_required: false,
    }),
  ).toMatchObject({
    firstName: '',
    lastName: '',
    email: '',
    dob: '1990-05-12',
    gender: 'Female',
    title: 'Mrs',
    phone: '',
    mobile: '9876543210',
    country: 'India',
    stateId: '12',
    pincode: '123456',
    panelVal: 'No',
  });
  expect(mapPatientForm({ date_of_birth: '2023-02-29' }).dob).toBe('');
  expect(mapPatientForm().gender).toBe('');
});

test('keeps Self and Family Member edits separate across switches and unrelated updates', async () => {
  let root!: ReactTestRenderer;
  const props = {
    route: {
      key: 'add',
      name: 'AddPatient',
      params: {
        patientDetails: {
          first_name: 'Self name',
          phone: '9876543210',
          emergencyContacts: [{phone: '9876543210', is_primary: true}],
          address: 'Self address',
          panel_required: true,
        },
      },
    },
    navigation: {},
  } as NativeStackScreenProps<RootStackParamList, 'AddPatient'>;
  await act(async () => {
    root = create(<AddPatient {...props} />);
  });
  const field = (label: string) =>
    root.root.find(
      node => typeof node.type === 'string' && node.props.label === label,
    );
  expect(field('First Name *').props.value).toBe('Self name');
  expect(field('Country *').props.options).toEqual([{label: 'India', value: '101'}]);
  await act(async () => field('Country *').props.onSelect('101'));
  expect(field('Country *').props.value).toBe('101');
  expect(getStatesByCountryId).toHaveBeenCalledWith('101', expect.any(AbortSignal));
  expect(field('State *').props.options).toEqual([{label: 'Delhi', value: '10'}]);
  act(() => field('State *').props.onSelect('10'));
  expect(field('State *').props.value).toBe('10');
  act(() => field('Patient Type *').props.onSelect('Family Member'));
  expect(field('First Name *').props.value).toBe('');
  expect(field('Phone *').props.value).toBe('');
  expect(field('Address').props.value).toBe('');
  expect(field('Panel Required').props.value).toBe('');
  act(() => field('First Name *').props.onChangeText('Family name'));
  act(() => field('Email').props.onChangeText('family@example.com'));
  expect(field('First Name *').props.value).toBe('Family name');
  act(() => field('Patient Type *').props.onSelect('Self'));
  expect(field('First Name *').props.value).toBe('Self name');
  expect(field('Phone *').props.value).toBe('9876543210');
  expect(field('Email').props.value).toBe('');
  act(() => field('Patient Type *').props.onSelect('Family Member'));
  expect(field('First Name *').props.value).toBe('Family name');
  expect(field('Email').props.value).toBe('family@example.com');
  await act(async () => root.unmount());
});

test('sends emergency contact inputs as JSON separately from the patient phone and email', async () => {
  let root!: ReactTestRenderer;
  const props = {route: {key: 'add', name: 'AddPatient', params: {patientDetails: {
    patient_id: 10, phone: '9876543210', email: 'patient@example.com',
    emergencyContacts: [{phone: '9876500000', email: 'jane@example.com', is_primary: true}],
  }}}, navigation: {}} as NativeStackScreenProps<RootStackParamList, 'AddPatient'>;
  await act(async () => { root = create(<AddPatient {...props} />); });
  await act(async () => root.root.find(node => typeof node.type === 'string' && node.type === 'submit').props.onPress());
  const calls = jest.mocked(editFamilyMember).mock.calls;
  const data = calls[calls.length - 1][0] as unknown as {get(key: string): string};
  expect(data.get('patientId')).toBe('10');
  expect(data.get('phone')).toBe('9876543210');
  expect(data.get('email')).toBe('patient@example.com');
  expect(JSON.parse(data.get('emergencyContacts'))).toEqual([
    {phone: '9876500000', email: 'jane@example.com', is_primary: true},
  ]);
  await act(async () => root.unmount());
});

test('includes emergency contacts when adding a family member', async () => {
  let root!: ReactTestRenderer;
  const props = {route: {key: 'add', name: 'AddPatient', params: {
    patientDetails: {patient_id: 10},
  }}, navigation: {}} as NativeStackScreenProps<RootStackParamList, 'AddPatient'>;
  await act(async () => { root = create(<AddPatient {...props} />); });
  const field = (label: string) => root.root.find(node => typeof node.type === 'string' && node.props.label === label);
  act(() => field('Patient Type *').props.onSelect('Family Member'));
  act(() => {
    field('Relation Of *').props.onChangeText('Daughter');
    field('Phone Number *').props.onChangeText('9876543210');
    field('Phone *').props.onChangeText('9876500000');
    field('Email').props.onChangeText('jane@example.com');
  });
  await act(async () => root.root.find(node => typeof node.type === 'string' && node.type === 'submit').props.onPress());
  const calls = jest.mocked(addFamilyMember).mock.calls;
  const data = calls[calls.length - 1][0] as unknown as {get(key: string): string};
  expect(data.get('parentPatientId')).toBe('10');
  expect(data.get('phone')).toBe('9876543210');
  expect(JSON.parse(data.get('emergencyContacts'))).toEqual([
    {phone: '9876500000', email: 'jane@example.com', is_primary: true},
  ]);
  await act(async () => root.unmount());
});
