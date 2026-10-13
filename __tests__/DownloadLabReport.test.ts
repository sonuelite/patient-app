import {Platform} from 'react-native';
import BlobUtil from 'react-native-blob-util';
import {downloadLabReport} from '../src/utils/downloadLabReport';
import type {PatientLabTest} from '../src/network/api';

jest.mock('../src/store', () => ({store: {
  getState: () => ({auth: {accessToken: 'stored-token', isLoggedIn: true}}),
}}));
jest.mock('../src/network/client', () => ({apiClient: {
  getUri: ({url}: {url: string}) => `https://example.com${url}`,
}}));
jest.mock('react-native-blob-util', () => ({
  config: jest.fn(),
  fs: {dirs: {CacheDir: '/cache', DocumentDir: '/documents'}, cp: jest.fn().mockResolvedValue(undefined), slice: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn(), unlink: jest.fn().mockResolvedValue(undefined)},
  MediaCollection: {copyToMediaStore: jest.fn().mockResolvedValue('content://report')},
  android: {actionViewIntent: jest.fn()},
}));

const lab = {type: 'direct', reference_id: 30, can_download: true} as PatientLabTest;
const fetchPdf = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(Platform, 'OS', {value: 'android', configurable: true});
  Object.defineProperty(Platform, 'Version', {value: 36, configurable: true});
  jest.mocked(BlobUtil.config).mockReturnValue({...BlobUtil, fetch: fetchPdf});
  fetchPdf.mockResolvedValue({info: () => ({status: 200})});
  jest.mocked(BlobUtil.fs.readFile).mockResolvedValue('%PDF-');
  jest.mocked(BlobUtil.android.actionViewIntent).mockResolvedValue(true);
});

test('saves to Downloads and returns a local file for the in-app viewer', async () => {
  const result = await downloadLabReport(lab);
  expect(fetchPdf).toHaveBeenCalledWith('GET',
    'https://example.com/api/v1/patient/lab-report/pdf/direct/30',
    {Authorization: 'Bearer stored-token', 'x-entity-id': '1', Accept: 'application/pdf'});
  expect(BlobUtil.MediaCollection.copyToMediaStore).toHaveBeenCalledWith(
    expect.objectContaining({mimeType: 'application/pdf'}), 'Download', expect.any(String));
  expect(result.path).toMatch(/^\/cache\/lab-report-direct-30-.*\.pdf$/);
  expect(BlobUtil.android.actionViewIntent).not.toHaveBeenCalled();
  expect(BlobUtil.fs.unlink).not.toHaveBeenCalledWith(expect.stringMatching(/\.pdf$/));
});

test('saves an iOS copy and keeps the local file available for the in-app viewer', async () => {
  Object.defineProperty(Platform, 'OS', {value: 'ios', configurable: true});
  const result = await downloadLabReport(lab);
  expect(BlobUtil.fs.cp).toHaveBeenCalledWith(result.path, `/documents/${result.name}`);
  expect(BlobUtil.fs.unlink).not.toHaveBeenCalledWith(result.path);
  expect(BlobUtil.MediaCollection.copyToMediaStore).not.toHaveBeenCalled();
});

test('does not save HTTP errors or non-PDF responses', async () => {
  fetchPdf.mockResolvedValueOnce({info: () => ({status: 401})});
  await expect(downloadLabReport(lab)).rejects.toThrow('Unable to download');
  jest.mocked(BlobUtil.fs.readFile).mockResolvedValueOnce('{"err');
  await expect(downloadLabReport(lab)).rejects.toThrow('valid PDF');
  expect(BlobUtil.MediaCollection.copyToMediaStore).not.toHaveBeenCalled();
  expect(BlobUtil.fs.unlink).toHaveBeenCalled();
});

test('does not request reports that are not ready', async () => {
  await expect(downloadLabReport({...lab, can_download: false})).rejects.toThrow('not ready');
  expect(fetchPdf).not.toHaveBeenCalled();
});
