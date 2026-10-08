import {getAllDoctors} from '../src/network/api';
import type {PatientDoctor} from '../src/network/api';
import {apiClient} from '../src/network/client';
import {mapPatientDoctor} from '../src/utils/doctor';

jest.mock('../src/network/client', () => ({
  apiClient: {get: jest.fn()}, publicClient: {},
}));

const doctor: PatientDoctor = {
  employee_id: 75, full_name: 'Test Doctor', employee_code: 'EMP75',
  employee_official_email: null, emp_personal_email: '', contact_number: null,
  country_code: '+91', fee: null, department_id: null, dept_id: 73,
  department_name: 'Radiology', status: 'ACTIVE',
};

beforeEach(() => jest.clearAllMocks());

test('preserves API profile details when doctors are mapped for Redux', () => {
  const timeSlots = [{start_time: '09:00', end_time: '12:00'}];
  expect(mapPatientDoctor({
    ...doctor,
    hospital_name: 'Apollo Hospital',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    about: 'Neurology consultant',
    experience: '12',
    languages: ['English', 'Hindi'],
    employee_photo: 'https://example.com/doctor.png',
    time_slots: timeSlots,
    dept_id: null,
    department_id: 26,
  })).toMatchObject({
    hospital: 'Apollo Hospital',
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    about: 'Neurology consultant',
    experience: 12,
    languages: ['English', 'Hindi'],
    photo: 'https://example.com/doctor.png',
    timeSlots,
    departmentId: 26,
  });
});

test('uses safe defaults for null profile details and falls back to entity name', () => {
  expect(mapPatientDoctor({
    ...doctor, hospital_name: null, entity_name: 'Apollo Hospital',
    available_days: null, about: null, experience: null,
    languages: null, employee_photo: null, time_slots: null,
  })).toMatchObject({
    hospital: 'Apollo Hospital', availableDays: [], about: '',
    experience: null, languages: [], photo: '', timeSlots: [],
  });
});

test('loads doctors with the selected entity and cancellation signal', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data: [doctor]}});
  const controller = new AbortController();
  await expect(getAllDoctors('12', controller.signal)).resolves.toEqual([doctor]);
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/patient/getAllDoctors', {
    params: {entity_id: '12'}, signal: controller.signal,
  });
});

test.each([
  {success: false, message: 'Access denied', data: []},
  {success: true, message: 'Invalid response', data: null},
])('rejects failed or malformed responses', async response => {
  jest.mocked(apiClient.get).mockResolvedValue({data: response});
  await expect(getAllDoctors('12')).rejects.toThrow(response.message);
});

test.each([[null, null], ['700.00', 700], ['0.00', 0], ['invalid', null]] as const)(
  'maps fee %s without treating missing prices as free', (fee, expected) => {
    expect(mapPatientDoctor({...doctor, fee})).toMatchObject({
      id: '75', name: 'Test Doctor', specialty: 'Radiology',
      consultationFee: expected, rating: null, experience: null,
    });
  },
);
