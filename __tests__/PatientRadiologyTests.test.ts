import {getPatientRadiologyTests} from '../src/network/api';
import {apiClient} from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: {get: jest.fn()}, publicClient: {},
}));

test('requests the selected patient and dates and preserves rejected report details', async () => {
  const data = [{reference_id: 25, test_status: 'REJECT', findings: 'Report findings',
    impression: 'Report impression', can_download: false, download_status: 'REJECTED'}];
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data}});
  const controller = new AbortController();
  await expect(getPatientRadiologyTests('11', '2026-10-09', '2026-10-10', controller.signal))
    .resolves.toEqual(data);
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/patient/patient-radiology-tests', {
    params: {patient_id: '11', start_date: '2026-10-09', end_date: '2026-10-10'},
    headers: {'x-entity-id': '1'}, signal: controller.signal,
  });
});

test('accepts empty records and rejects API failures and malformed responses', async () => {
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: true, data: []}});
  await expect(getPatientRadiologyTests(11, '2026-10-09', '2026-10-10')).resolves.toEqual([]);
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: false, message: 'Access denied'}});
  await expect(getPatientRadiologyTests(11, '2026-10-09', '2026-10-10')).rejects.toThrow('Access denied');
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: true, data: null}});
  await expect(getPatientRadiologyTests(11, '2026-10-09', '2026-10-10')).rejects.toThrow('Unable to load radiology reports');
});
