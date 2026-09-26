import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../src/types';
import AddPatient from '../src/screens/patient/profile/familyMembers/AddPatient';
import { mapPatientForm } from '../src/utils/patientForm';

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
jest.mock('../src/components/customButton/CustomButton', () => () => null);
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
    phone: '9876543210',
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
