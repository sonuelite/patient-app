import {createAppStore} from '../src/store';
import {setDoctors} from '../src/store/doctorsSlice';
import {selectDoctors} from '../src/store/selectors';
import {completeLogin, logout, selectEntity} from '../src/store/authSlice';
import {mapPatientDoctor} from '../src/utils/doctor';
import {session} from '../testUtils/auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
  removeItem: jest.fn(async () => undefined),
}));

const doctor = mapPatientDoctor({
  employee_id: 75, full_name: 'Test Doctor', employee_code: 'EMP75',
  employee_official_email: null, emp_personal_email: null,
  contact_number: null, country_code: '+91', fee: '700.00',
  department_id: null, dept_id: 73, department_name: 'Radiology', status: 'ACTIVE',
});

test('shares API doctors through Redux and clears them when the hospital or account changes', async () => {
  const store = createAppStore();
  expect(selectDoctors(store.getState())).toEqual([]);
  await store.dispatch(completeLogin(session)).unwrap();
  store.dispatch(setDoctors([doctor]));
  expect(selectDoctors(store.getState())).toEqual([doctor]);

  await store.dispatch(selectEntity('hospital-b')).unwrap();
  expect(selectDoctors(store.getState())).toEqual([]);

  store.dispatch(setDoctors([doctor]));
  await store.dispatch(logout()).unwrap();
  expect(selectDoctors(store.getState())).toEqual([]);
});
