import {PermissionsAndroid, Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {apiClient} from '../network/client';
import type {PatientLabTest} from '../network/api';
import {store} from '../store';

export async function downloadLabReport(lab: PatientLabTest): Promise<{name: string; path: string}> {
  if (!lab.can_download) {
    throw new Error('This lab report is not ready for download');
  }
  const {accessToken, isLoggedIn} = store.getState().auth;
  if (!isLoggedIn || !accessToken) {
    throw new Error('Please sign in to download your lab report');
  }
  if (Platform.OS === 'android' && Number(Platform.Version) < 29) {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Storage permission is required to save the report');
    }
  }

  // The patient PDF route differs from download_url in the list response.
  const url = apiClient.getUri({
    url: `/api/v1/patient/lab-report/pdf/${encodeURIComponent(lab.type)}/${lab.reference_id}`,
  });
  const name = `lab-report-${lab.type.replace(/[^a-zA-Z0-9_-]/g, '_')}-${lab.reference_id}-${Date.now()}.pdf`;
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${name}`;
  let keepForPreview = false;
  try {
    const response = await ReactNativeBlobUtil.config({path, timeout: 30000})
      .fetch('GET', url, {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': '1',
        Accept: 'application/pdf',
      });
    if (response.info().status < 200 || response.info().status >= 300) {
      throw new Error('Unable to download lab report. Please try again');
    }
    // Reject JSON/HTML errors returned with HTTP 200 before saving as a PDF.
    const signaturePath = `${path}.header`;
    try {
      await ReactNativeBlobUtil.fs.slice(path, signaturePath, 0, 5);
      const signature = await ReactNativeBlobUtil.fs.readFile(signaturePath, 'utf8');
      if (signature !== '%PDF-') {
        throw new Error('The server did not return a valid PDF report');
      }
    } finally {
      await ReactNativeBlobUtil.fs.unlink(signaturePath).catch(() => undefined);
    }
    if (Platform.OS === 'android') {
      if (Number(Platform.Version) >= 29) {
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {name, parentFolder: '', mimeType: 'application/pdf'},
          'Download',
          path,
        );
      } else {
        await ReactNativeBlobUtil.fs.cp(path, `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${name}`);
      }
    } else {
      await ReactNativeBlobUtil.fs.cp(path, `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${name}`);
    }
    // The caller owns this cached copy until the in-app viewer closes.
    keepForPreview = true;
    return {name, path};
  } finally {
    if (!keepForPreview) {
      await ReactNativeBlobUtil.fs.unlink(path).catch(() => undefined);
    }
  }
}
