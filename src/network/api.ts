import {apiClient, publicClient} from './client';
import type {PatientLoginResponse} from '../types/auth';
export {apiClient} from './client';

export interface RelatedPatient {
  patient_id: number;
  uuid: string;
  uhid: string;
  first_name: string;
  last_name: string;
  gender: string;
  photo: string | null;
  relation_of: string;
  parent_patient_id: number | null;
  is_main_patient: boolean;
  email: string | null;
  phone: string | null;
  status: string;
}

interface RelatedPatientsResponse {
  success: boolean;
  message?: string;
  data: RelatedPatient[];
}

export async function getAllRelatedPatients(
  patientId: number,
  signal?: AbortSignal,
): Promise<RelatedPatient[]> {
  const response = await apiClient.get<RelatedPatientsResponse>(
    `/api/v1/patient/getAllRelatedPatients/${patientId}`,
    {signal},
  );
  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || 'Unable to load family members');
  }
  return response.data.data;
}

export interface AddFamilyMemberData {
  parentPatientId: number;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  relationOf: string;
}

export interface AddFamilyMemberResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

export async function addFamilyMember(
  data: AddFamilyMemberData,
): Promise<AddFamilyMemberResponse> {
  const formData = new FormData();
  formData.append('parentPatientId', String(data.parentPatientId));
  formData.append('firstName', data.firstName.trim());
  formData.append('lastName', data.lastName.trim());
  formData.append('dob', data.dob.trim());
  formData.append('gender', data.gender);
  formData.append('relationOf', data.relationOf.trim());

  const response = await apiClient.post<AddFamilyMemberResponse>(
    '/api/v1/patient/addFamilyMember', formData,
    {headers: {'Content-Type': 'multipart/form-data'}},
  );
  if (response.data.success === false) {
    throw new Error(response.data.message || 'Unable to add family member');
  }
  return response.data;
}

// ==============================
// Register Patient
// ==============================

export interface RegisterPatientData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  password: string;
  photo?: {
    uri: string;
    type: string;
    name: string;
  };
}

export const registerPatient = async (
  data: RegisterPatientData,
  entityId?: string,
) => {
  const formData = new FormData();

  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  formData.append('phone', data.phone);
  formData.append('email', data.email);
  formData.append('gender', data.gender);
  formData.append('dob', data.dob);
  formData.append('password', data.password);

  if (data.photo) {
    formData.append(
      'photo',
      {
        uri: data.photo.uri,
        type: data.photo.type,
        name: data.photo.name,
      },
    );
  }

  const response = await publicClient.post<{success?: boolean; message?: string}>(
    '/api/v1/patient/register_patient',
    formData,
    {
      headers: {
        ...(entityId ? {'x-entity-id': entityId} : {}),
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    },
  );

  return response.data;
};

// ==============================
// Patient Sign In
// ==============================

export interface PatientSigninData {
  email: string;
  password: string;
}

export type PatientSigninResponse = PatientLoginResponse;

export const patientSignin = async (
  data: PatientSigninData,
) => {
  const response = await publicClient.post<PatientSigninResponse>(
    '/api/v1/patient/patientSignin',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  return response.data;
};

// ==============================
// Verify Patient Phone
// ==============================

export interface VerifyPatientPhoneData {
  phone: string;
}

export interface VerifyPatientPhoneResponse {
  success: boolean;
  message?: string;
  isValid?: boolean;
  data?: { phone?: string };
}

export const verifyPatientPhone = async (
  data: VerifyPatientPhoneData,
): Promise<VerifyPatientPhoneResponse> => {
  const response =
    await publicClient.post<VerifyPatientPhoneResponse>(
      '/api/v1/patient/verifyPhone',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

  return response.data;
};

export interface VerifyOtpData {
  phone: string;
  otp: string;
}

export type VerifyOtpResponse = PatientLoginResponse;

export const verifyPatientOtp = async (
  data: VerifyOtpData,
): Promise<VerifyOtpResponse> => {
  const response = await publicClient.post<VerifyOtpResponse>(
    '/api/v1/patient/verifyOtp',
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  return response.data;
};
