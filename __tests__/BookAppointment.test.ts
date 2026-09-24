import {bookAppointment} from '../src/network/api';
import type {BookAppointmentData} from '../src/network/api';
import {apiClient} from '../src/network/client';
import {mapPatientDoctor} from '../src/utils/doctor';

jest.mock('../src/network/client', () => ({
  apiClient: {post: jest.fn()}, publicClient: {},
}));

const input: BookAppointmentData = {
  patientId: 52, department: 3, doctor: {employee_id: 15},
  appointmentDate: '2026-09-25', appointmentTime: '10:30',
  appointmentType: 'New Consultation', bookingFor: 'self', bookingSource: 'App',
  purposeOfVisit: 'Fever', charges: 500, discountPercent: 0, paidAmount: 0, remarks: '',
};

beforeEach(() => jest.clearAllMocks());

test('posts the booking contract and returns server-generated confirmation details', async () => {
  const data = {appointment_id: 13, token_no: 1, bill_no: 'BILL202609230003', netAmount: 500};
  jest.mocked(apiClient.post).mockResolvedValue({data: {success: true, data}});
  await expect(bookAppointment(input)).resolves.toEqual(data);
  expect(apiClient.post).toHaveBeenCalledWith('/api/v1/patient/bookAppointment', input);
});

test.each([
  {success: false, message: 'Slot unavailable'},
  {success: true, data: null},
])('does not confirm a failed or incomplete booking response', async response => {
  jest.mocked(apiClient.post).mockResolvedValue({data: response});
  await expect(bookAppointment(input)).rejects.toThrow();
});

test('preserves the specialty department ID rather than the employee department ID', () => {
  const doctor = mapPatientDoctor({
    employee_id: 15, full_name: 'Test Doctor', employee_code: 'EMP15',
    employee_official_email: null, emp_personal_email: null, contact_number: null,
    country_code: '+91', fee: '500.00', department_id: 2, dept_id: 3,
    department_name: 'Neurology', status: 'ACTIVE',
  });
  expect(doctor.departmentId).toBe(3);
});
