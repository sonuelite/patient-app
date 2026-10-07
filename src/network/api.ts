import {apiClient, publicClient} from './client';
import type {PatientLoginResponse} from '../types/auth';
import type {PatientDetails, PatientDetailsResponse} from '../types/patientDetails';
export {apiClient} from './client';
import {normalizePatientStates, PatientStateOption} from '../utils/patientStateOptions';
import axios from 'axios';

export async function getStatesByCountryId(
  countryId: string | number, signal?: AbortSignal,
): Promise<PatientStateOption[]> {
  const response = await apiClient.get(
    '/api/v1/patient/getStatesByCountryId/' + encodeURIComponent(countryId),
    {headers: {'x-entity-id': '1'}, signal, timeout: 15000},
  );
  if (response.data?.success === false ||
      (response.data?.code !== undefined && response.data.code !== 200)) {
    throw new Error(response.data.message || 'Unable to load states');
  }
  return normalizePatientStates(response.data);
}

export interface CountryOption {
  countryss_id: number | string;
  countryss_name: string;
}

export async function getAllActiveCountry(signal?: AbortSignal): Promise<CountryOption[]> {
  const response = await apiClient.get<{
    success?: boolean; code?: number; message?: string; data?: CountryOption[];
  }>('/api/v1/patient/getAllActiveCountry', {
    headers: {'x-entity-id': '1'}, signal, timeout: 15000,
  });
  if (response.data.success === false ||
      (response.data.code !== undefined && response.data.code !== 200) ||
      !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || 'Unable to load countries');
  }
  return response.data.data;
}

export interface CityOption {
  city_id: number | string;
  city_name: string;
}

export async function getCityByStateId(
  stateId: string | number,
  signal?: AbortSignal,
): Promise<CityOption[]> {
  const response = await apiClient.get<{
    success?: boolean;
    code?: number;
    message?: string;
    data?: CityOption[];
  }>(
    `/api/v1/patient/getCityByStateId/${encodeURIComponent(String(stateId))}`,
    {
      headers: {'x-entity-id': '1'},
      signal,
      timeout: 15000,
    },
  );
  if (
    response.data.success === false ||
    (response.data.code !== undefined && response.data.code !== 200) || 
    !Array.isArray(response.data.data)
  ) {
    throw new Error(response.data.message || 'Unable to load cities');
  }
  return response.data.data;
}

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export type EditFamilyMemberPayload = {
  // parentPatientId: string | number;
  patientId: string | number;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: string | number;
  gender: string;
  maritalStatus: string;
  bloodGroup: string;
  idProofType: string;
  idProofNo: string;
  relationOf: string;
  relationName: string;
  relationPhone: string;
  phone: string;
  email: string;
  address: string;
  countryId: string | number;
  stateId: string | number;
  cityId: string | number;
  area: string;
  pincode: string;
  canShareData: 'Yes' | 'No';
  membershipId: string;
  patientType: string;
  typeReference: string;
  panelType: string;
  panel: string;
  policyNo: string;
  trusteeStaff: string;
  photo?: UploadFile | null;
  panel_pdf?: UploadFile | null;
  consent_pdf?: UploadFile | null;
};

// export async function editFamilyMember(
//   formData: FormData
// ) {
//   // const formData = new FormData();

//   // for (const [key, value] of Object.entries(payload)) {
//   //   if (value == null) continue;

//   //   if (key === 'photo' || key === 'panel_pdf' || key === 'consent_pdf') {
//   //     formData.append(key, value as UploadFile);
//   //   } else {
//   //     formData.append(key, String(value));
//   //   }
//   // }

//   const response = await apiClient.put(
//     '/api/v1/patient/editFamilyMember',
//     formData,
//     {
//       headers: {
//         'x-entity-id': '1',
//         'Content-Type': 'multipart/form-data',
//       },
//     },
//   );
// console.log('editFamilyMember response:', response.data);
//   if (response.data?.success === false) {
//     throw new Error(response.data.message || 'Unable to update family member');
//   }
//   return response.data;
// }


export async function editFamilyMember(formData: FormData) {
  try {
    const response = await apiClient.put(
      '/api/v1/patient/editFamilyMember',
      formData,
      {
        headers: {
          'x-entity-id': '1',
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    console.log('Edit family member response:', response.data);

    if (response.data?.success === false) {
      throw new Error(
        response.data.message || 'Unable to update family member',
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Edit family member HTTP status:', error.response?.status);
      console.log('Edit family member error response:', error.response?.data);
    } else {
      console.log('Edit family member error:', error);
    }

    throw error;
  }
}


export async function getPatientDetails(
  patientId: number,
  signal?: AbortSignal,
): Promise<PatientDetails> {
  const response = await apiClient.get<PatientDetailsResponse>(
    '/api/v1/patient/getPatientDetails', {params: {id: patientId}, signal},
  );
  const {success, data, message, error} = response.data;
  if (success !== true || !data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(message || error || 'Unable to load patient details');
  }
  return data;
}

export interface PayAppointmentData {
  billingId: string;
  amountPaid: number;
  paymentMode: string;
  paymentDetails: string;
}

export async function payAppointment(data: PayAppointmentData): Promise<void> {
  const response = await apiClient.post<{success: boolean; message?: string}>(
    '/api/v1/patient/payAppointment', data,
  );
  if (response.data.success !== true) {
    throw new Error(response.data.message || 'Unable to pay for appointment');
  }
}

export interface BookAppointmentData {
  patientId: number;
  department: number;
  doctor: {employee_id: number};
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  bookingFor: string;
  bookingSource: 'App';
  purposeOfVisit: string;
  charges: number;
  discountPercent: number;
  paidAmount: number;
  remarks: string;
}

export interface BookedAppointment {
  appointment_id: number;
  patient_id: number;
  patient_name: string;
  bookingFor: string;
  appointmentDate: string;
  appointmentTime: string;
  token_no: number;
  bill_no: string;
  netAmount: number;
  status: string;
  booked_by: string;
}

export async function bookAppointment(data: BookAppointmentData): Promise<BookedAppointment> {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    data: BookedAppointment;
  }>('/api/v1/patient/bookAppointment', data);
  if (!response.data.success || !response.data.data?.appointment_id) {
    throw new Error(response.data.message || 'Unable to book appointment');
  }
  return response.data.data;
}

export interface PatientDoctor {
  full_name: string;
  employee_official_email: string | null;
  employee_code: string;
  fee: string | number | null;
  contact_number: string | null;
  employee_id: number;
  country_code: string | null;
  emp_personal_email: string | null;
  department_id: number | null;
  status: string;
  dept_id: number | null;
  department_name: string;
}

export async function getAllDoctors(
  entityId: string | number,
  signal?: AbortSignal,
): Promise<PatientDoctor[]> {
  const response = await apiClient.get<{
    success: boolean;
    code: number;
    message?: string;
    data: PatientDoctor[];
  }>('/api/v1/patient/getAllDoctors', {
    params: {entity_id: entityId},
    signal,
  });
  if (!response.data.success || !Array.isArray(response.data.data)) {
    throw new Error(response.data.message || 'Unable to load doctors');
  }
  return response.data.data;
}

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

// export interface AddFamilyMemberData {
//   parentPatientId: number;
//   firstName: string;
//   lastName: string;
//   dob: string;
//   gender: 'Male' | 'Female' | 'Other';
//   relationOf: string;
// }

// export interface AddFamilyMemberResponse {
//   success?: boolean;
//   message?: string;
//   data?: unknown;
// }

// export async function addFamilyMember(
//   data: AddFamilyMemberData,
// ): Promise<AddFamilyMemberResponse> {
//   const formData = new FormData();
//   formData.append('parentPatientId', String(data.parentPatientId));
//   formData.append('firstName', data.firstName.trim());
//   formData.append('lastName', data.lastName.trim());
//   formData.append('dob', data.dob.trim());
//   formData.append('gender', data.gender);
//   formData.append('relationOf', data.relationOf.trim());

//   const response = await apiClient.post<AddFamilyMemberResponse>(
//     '/api/v1/patient/addFamilyMember', formData,
//     {headers: {'Content-Type': 'multipart/form-data'}},
//   );
//   if (response.data.success === false) {
//     throw new Error(response.data.message || 'Unable to add family member');
//   }
//   return response.data;
// }

export async function addFamilyMember(formData: FormData) {
  const response = await apiClient.post(
    '/api/v1/patient/addFamilyMember',
    formData,
    {
      headers: {
        'x-entity-id': '1',
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (response.data?.success === false) {
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
) : Promise<PatientLoginResponse> => {
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

  const response = await publicClient.post<PatientLoginResponse>(
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

export const getMyAppointments = async (
  patientId: number | string,
  signal?: AbortSignal,
) => {
  const response = await apiClient.get(
    '/api/v1/patient/getMyAppointments',
    {
      params: {
        patient_id: patientId,
      },
      signal,
    },
  );

  const result = response.data;

  if (
    result?.success === false ||
    (result?.code !== undefined && result.code !== 200)
  ) {
    throw new Error(
      result?.message || 'Unable to fetch appointments',
    );
  }

  if (!Array.isArray(result?.data)) {
    throw new Error('Invalid appointments response');
  }

  return result.data;
};

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
}

export const forgotPatientPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const response = await publicClient.post<ForgotPasswordResponse>(
    '/api/v1/patient/forgotPassword',
    {email},
    {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  if (response.data?.success === false) {
    throw new Error(
      response.data.message || 'Unable to send OTP',
    );
  }

  return response.data;
};

export interface ResetPatientPasswordData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPatientPasswordResponse {
  success?: boolean;
  message?: string;
}

export const resetPatientPassword = async (
  data: ResetPatientPasswordData,
): Promise<ResetPatientPasswordResponse> => {
  const response =
    await publicClient.post<ResetPatientPasswordResponse>(
      '/api/v1/patient/resetPassword',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

  if (response.data?.success === false) {
    throw new Error(
      response.data.message || 'Unable to reset password',
    );
  }

  return response.data;
};