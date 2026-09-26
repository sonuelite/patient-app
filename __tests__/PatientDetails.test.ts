import { getPatientDetails } from '../src/network/api';
import { apiClient } from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: { get: jest.fn() },
  publicClient: {},
}));

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
