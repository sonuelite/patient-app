type PatientValue = string | number | null;

export interface PatientDetails {
  patient_id?: number;
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  mobile?: PatientValue;
  phone?: PatientValue;
  email?: string | null;
  address?: string | null;
  country?: PatientValue;
  country_name?: string | null;
  country_id?: PatientValue;
  state?: PatientValue;
  state_name?: string | null;
  state_id?: PatientValue;
  city?: PatientValue;
  city_name?: string | null;
  city_id?: PatientValue;
  area?: string | null;
  pincode?: PatientValue;
  panel_required?: boolean | PatientValue;
}

export interface PatientDetailsResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: PatientDetails | null;
}
