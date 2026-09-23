import {addFamilyMember, getAllRelatedPatients} from '../src/network/api';
import {apiClient} from '../src/network/client';
import type {AddFamilyMemberData} from '../src/network/api';

jest.mock('../src/network/client', () => ({
  apiClient: {post: jest.fn(), get: jest.fn()}, publicClient: {post: jest.fn()},
}));

const input: AddFamilyMemberData = {
  parentPatientId: 52, firstName: ' Aaravi ', lastName: ' Test ',
  dob: '2010-05-12', gender: 'Female', relationOf: ' Daughter ',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(FormData.prototype, 'append').mockImplementation(() => undefined);
});
afterEach(() => { jest.restoreAllMocks(); });

test('loads related patients for the supplied patient ID with cancellation', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: true, data: []}});
  const controller = new AbortController();
  await expect(getAllRelatedPatients(input.parentPatientId, controller.signal)).resolves.toEqual([]);
  expect(apiClient.get).toHaveBeenCalledWith(
    `/api/v1/patient/getAllRelatedPatients/${input.parentPatientId}`,
    {signal: controller.signal},
  );
});

test('does not treat a failed related-patient response as an empty family', async () => {
  jest.mocked(apiClient.get).mockResolvedValue({data: {success: false, message: 'Access denied'}});
  await expect(getAllRelatedPatients(input.parentPatientId)).rejects.toThrow('Access denied');
});

test('sends exactly the six fields in the updated multipart contract', async () => {
  jest.mocked(apiClient.post).mockResolvedValue({data: {success: true}});
  await addFamilyMember(input);
  const [url, body, config] = jest.mocked(apiClient.post).mock.calls[0];
  expect(url).toBe('/api/v1/patient/addFamilyMember');
  expect(body).toBeInstanceOf(FormData);
  expect(config?.headers).toEqual({'Content-Type': 'multipart/form-data'});
  const parts = jest.mocked(FormData.prototype.append).mock.calls;
  expect(parts.map(part => part[0])).toEqual([
    'parentPatientId', 'firstName', 'lastName', 'dob', 'gender', 'relationOf',
  ]);
  expect(parts.map(part => part[1])).toEqual([
    '52', 'Aaravi', 'Test', '2010-05-12', 'Female', 'Daughter',
  ]);
});

test('rejects a server-declared failure', async () => {
  jest.mocked(apiClient.post).mockResolvedValue({data: {success: false, message: 'Invalid relation'}});
  await expect(addFamilyMember(input)).rejects.toThrow('Invalid relation');
});
