import axios from 'axios';

const API_BASE_URL =
  'https://hims-api.zynotechnologies.com';

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
      } as any,
    );
  }

  const response = await axios.post(
    `${API_BASE_URL}/api/v1/patient/register_patient`,
    formData,
    {
      headers: {
        'x-entity-id': '1',
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

export const patientSignin = async (
  data: PatientSigninData,
) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/v1/patient/patientSignin`,
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
  data?: unknown;
}

export const verifyPatientPhone = async (
  data: VerifyPatientPhoneData,
): Promise<VerifyPatientPhoneResponse> => {
  const response =
    await axios.post<VerifyPatientPhoneResponse>(
      `${API_BASE_URL}/api/v1/patient/verifyPhone`,
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

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  isValid?: boolean;
  data?: {
    accessToken?: string;
    [key: string]: unknown;
  };
  accessToken?: string;
}

export const verifyPatientOtp = async (
  data: VerifyOtpData,
): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    `${API_BASE_URL}/api/v1/patient/verifyOtp`,
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