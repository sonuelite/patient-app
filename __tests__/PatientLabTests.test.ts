import {getPatientLabTests} from '../src/network/api';
import {apiClient} from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: {get: jest.fn()}, publicClient: {},
}));

test('requests lab reports for the selected patient and date range', async () => {
  const data = [{reference_id: 30, test_name: 'Troponin-I Blood Test'}];
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data}});
  const controller = new AbortController();
  await expect(getPatientLabTests('11', '2026-10-09', '2026-10-13', controller.signal))
    .resolves.toEqual(data);
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/patient/patient-lab-tests', {
    params: {patient_id: '11', start_date: '2026-10-09', end_date: '2026-10-13'},
    headers: {'x-entity-id': '1'}, signal: controller.signal,
  });
});

test('accepts an empty range result and surfaces API errors', async () => {
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: true, data: []}});
  await expect(getPatientLabTests(11, '2026-10-09', '2026-10-13')).resolves.toEqual([]);
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: false, message: 'Invalid range'}});
  await expect(getPatientLabTests(11, '2026-10-09', '2026-10-13')).rejects.toThrow('Invalid range');
});
