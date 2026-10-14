import {PermissionsAndroid, Platform} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {apiClient} from '../network/client';
import type {PatientLabTest, PatientRadiologyTest} from '../network/api';
import {store} from '../store';

export async function downloadLabReport(lab: PatientLabTest): Promise<{name: string; path: string}> {
  if (!lab.can_download) {
    throw new Error('This lab report is not ready for download');
  }
  return downloadPdfReport(lab, 'lab', '1');
}

export function canDownloadRadiologyReport(report: PatientRadiologyTest): boolean {
  return report.approval_status?.toUpperCase() === 'APPROVED' && report.can_download;
}

export async function downloadRadiologyReport(report: PatientRadiologyTest): Promise<{name: string; path: string}> {
  if (!canDownloadRadiologyReport(report)) {
    throw new Error('Only approved radiology reports that are ready can be downloaded');
  }
  const entityId = store.getState().auth.selectedEntityId ?? '1';
  return downloadPdfReport(report, 'radiology', entityId);
}

async function downloadPdfReport(
  report: {type: string; reference_id: number},
  kind: 'lab' | 'radiology',
  entityId: string,
): Promise<{name: string; path: string}> {
  const {accessToken, isLoggedIn} = store.getState().auth;
  if (!isLoggedIn || !accessToken) {
    throw new Error(`Please sign in to download your ${kind} report`);
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
    url: `/api/v1/patient/${kind}-report/pdf/${encodeURIComponent(report.type)}/${report.reference_id}`,
  });
  const name = `${kind}-report-${report.type.replace(/[^a-zA-Z0-9_-]/g, '_')}-${report.reference_id}-${Date.now()}.pdf`;
  const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${name}`;
  let keepForPreview = false;
  try {
    const response = await ReactNativeBlobUtil.config({path, timeout: 30000})
      .fetch('GET', url, {
        Authorization: `Bearer ${accessToken}`,
        'x-entity-id': entityId,
        Accept: 'application/pdf',
      });
    if (response.info().status < 200 || response.info().status >= 300) {
      throw new Error(`Unable to download ${kind} report. Please try again`);
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
