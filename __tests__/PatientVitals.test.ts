import {getPatientVitals} from '../src/network/api';
import {apiClient} from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: {get: jest.fn()}, publicClient: {},
}));

test('requests the supplied patient and preserves the API measurements', async () => {
  const data = {id: 7, patient_id: 8, systolic: 16, diastolic: 26, map: 23,
    spo2: 0, o2_therapy: 'Non-Rebreather Mask (NRB)', temperature_unit: '°C'};
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data}});
  const controller = new AbortController();
  await expect(getPatientVitals('8', controller.signal)).resolves.toEqual(data);
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/patient/getpatientvitals', {
    params: {patient_id: '8'}, headers: {'x-entity-id': '1'}, signal: controller.signal,
  });
});

test('handles empty records and rejects records for a different patient', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data: null}});
  await expect(getPatientVitals(8)).resolves.toBeNull();
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data: {patient_id: 3}}});
  await expect(getPatientVitals(8)).rejects.toThrow('Invalid patient vitals response');
});

test('surfaces API errors', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: false, message: 'Access denied'}});
  await expect(getPatientVitals(8)).rejects.toThrow('Access denied');
});
