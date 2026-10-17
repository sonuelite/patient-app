import {getAllLabTests} from '../src/network/api';
import {apiClient} from '../src/network/client';

jest.mock('../src/network/client', () => ({
  apiClient: {get: jest.fn()}, publicClient: {},
}));

beforeEach(() => jest.clearAllMocks());

test('loads the lab catalog with entity header and cancellation support', async () => {
  const data = [{id: 4, test_name: ' Kidney Function Test (KFT)', price: 500}];
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data}});
  const controller = new AbortController();
  await expect(getAllLabTests(controller.signal)).resolves.toEqual(data);
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/patient/all-lab-tests', {
    headers: {'x-entity-id': '1'}, signal: controller.signal,
  });
});

test('accepts an empty catalog and rejects failed or malformed responses', async () => {
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: true, data: []}});
  await expect(getAllLabTests()).resolves.toEqual([]);
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: false, message: 'Catalog unavailable'}});
  await expect(getAllLabTests()).rejects.toThrow('Catalog unavailable');
  jest.mocked(apiClient.get).mockResolvedValueOnce({data: {success: true, data: null}});
  await expect(getAllLabTests()).rejects.toThrow('Unable to load lab tests');
});
