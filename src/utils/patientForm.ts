import type { PatientDetails } from '../types/patientDetails';

export type PatientType = 'Self' | 'Family Member';
export interface PatientDocument {
  uri: string;
  name: string | null;
  type: string | null;
  size: number | null;
}

export function patientText(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }
  const text = String(value).trim();
  return /^(null|undefined)$/i.test(text) ? '' : text;
}

function option(value: unknown, options: string[]): string {
  const text = patientText(value).replace(/\.$/, '').toLowerCase();
  return options.find(item => item.toLowerCase() === text) || '';
}

function birthDate(value: unknown): string {
  const match = patientText(value).match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:T.*)?$/,
  );
  if (!match) {
    return '';
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return '';
  }
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function mapPatientForm(patient: PatientDetails = {}) {
  const panel = patient.panel_required;
  const emergency = patient.emergencyContacts?.find(contact => contact.is_primary)
    || patient.emergencyContacts?.[0];
  return {
    title: option(patient.title, ['Mr', 'Ms', 'Mrs']),
    firstName: patientText(patient.first_name),
    lastName: patientText(patient.last_name),
    dob: birthDate(patient.date_of_birth),
    gender: option(patient.gender, ['Male', 'Female', 'Other']),
    mobile: patientText(patient.mobile) || patientText(patient.phone),
    phone: patientText(emergency?.phone),
    email: patientText(emergency?.email),
    address: patientText(patient.address),
    country: patientText(patient.country_name) || patientText(patient.country),
    countryId: patientText(patient.country_id),
    state: patientText(patient.state_name) || patientText(patient.state),
    stateId: patientText(patient.state_id),
    city: patientText(patient.city_name) || patientText(patient.city),
    cityId: patientText(patient.city_id),
    area: patientText(patient.area),
    pincode: patientText(patient.pincode),
    panelVal:
      panel === true || panel === 1 || panel === '1'
        ? 'Yes'
        : panel === false || panel === 0 || panel === '0'
        ? 'No'
        : option(panel, ['Yes', 'No']),
    selectedPdf: null as PatientDocument | null,
    selectedConsentPdf: null as PatientDocument | null,
  };
}

export type PatientForm = ReturnType<typeof mapPatientForm>;
