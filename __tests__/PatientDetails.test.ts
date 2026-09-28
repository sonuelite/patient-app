import { getPatientDetails, getAllActiveCountry, getStatesByCountryId } from '../src/network/api';
import { apiClient } from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: { get: jest.fn() },
  publicClient: {},
}));

test('loads states for the selected country through the patient endpoint', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data: [{states_id: 10, states_name: 'Delhi'}]}});
  const controller = new AbortController();
  await expect(getStatesByCountryId(101, controller.signal)).resolves.toEqual([{id: '10', name: 'Delhi'}]);
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/patient/getStatesByCountryId/101', {
    headers: {'x-entity-id': '1'}, signal: controller.signal, timeout: 15000,
  });
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: false, message: 'Unable to fetch states'}});
  await expect(getStatesByCountryId(101)).rejects.toThrow('Unable to fetch states');
});

test('loads countries from the patient endpoint without registration parameters', async () => {
  const data = [{countryss_id: 101, countryss_name: 'India'}];
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data}});
  await expect(getAllActiveCountry()).resolves.toEqual(data);
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/patient/getAllActiveCountry', {
    headers: {'x-entity-id': '1'}, signal: undefined, timeout: 15000,
  });
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: false, message: 'Access denied'}});
  await expect(getAllActiveCountry()).rejects.toThrow('Access denied');
});

test('fetches the supplied patient ID through the authenticated client', async () => {
  const data = { first_name: 'Patient', date_of_birth: null };
  jest
    .mocked(apiClient.get)
    .mockResolvedValue({ data: { success: true, data } });
  const controller = new AbortController();
  await expect(getPatientDetails(123, controller.signal)).resolves.toEqual(
    data,
  );
  expect(apiClient.get).toHaveBeenCalledWith(
    '/api/v1/patient/getPatientDetails',
    {
      params: { id: 123 },
      signal: controller.signal,
    },
  );
});

test('rejects success false with the API message, even if data is present', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({
    data: {
      success: false,
      message: 'Access denied',
      data: { first_name: 'Patient' },
    },
  });
  await expect(getPatientDetails(123)).rejects.toThrow('Access denied');
});

test('rejects a missing patient record', async () => {
  jest
    .mocked(apiClient.get)
    .mockResolvedValue({ data: { success: true, data: null } });
  await expect(getPatientDetails(123)).rejects.toThrow(
    'Unable to load patient details',
  );
});
