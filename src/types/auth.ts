export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | JsonObject;
export interface JsonObject {
  [key: string]: JsonValue;
}

export interface AuthPatient {
  patient_id: number;
  uuid: string;
  uhid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  photo: string | null;
  entityList: JsonObject[];
  financeList: JsonObject[];
}

export interface AuthSession {
  accessToken: string;
  patient: AuthPatient;
  selectedEntityId: string | null;
}

export interface PatientLoginResponse {
  success: boolean;
  message?: string;
  isValid?: boolean;
  accessToken?: string;
  data?: Partial<AuthPatient> & { accessToken?: string };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return true;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

function isJsonObject(value: unknown): value is JsonObject {
  return isRecord(value) && Object.values(value).every(isJsonValue);
}

export function parsePatient(value: unknown): AuthPatient {
  if (
    !isRecord(value) ||
    typeof value.patient_id !== 'number' ||
    !Number.isInteger(value.patient_id) ||
    value.patient_id <= 0 ||
    typeof value.uuid !== 'string' ||
    !value.uuid.trim() ||
    typeof value.uhid !== 'string' ||
    typeof value.first_name !== 'string' ||
    typeof value.last_name !== 'string' ||
    typeof value.email !== 'string' ||
    typeof value.phone !== 'string' ||
    (value.gender !== 'Male' &&
      value.gender !== 'Female' &&
      value.gender !== 'Other') ||
    (value.photo !== null && typeof value.photo !== 'string') ||
    !Array.isArray(value.entityList) ||
    !value.entityList.every(isJsonObject) ||
    !Array.isArray(value.financeList) ||
    !value.financeList.every(isJsonObject)
  ) {
    throw new Error(
      'Complete patient details were not received. Please sign in again.',
    );
  }
  return {
    patient_id: value.patient_id,
    uuid: value.uuid,
    uhid: value.uhid,
    first_name: value.first_name,
    last_name: value.last_name,
    email: value.email,
    phone: value.phone,
    gender: value.gender,
    photo: value.photo,
    entityList: value.entityList,
    financeList: value.financeList,
  };
}

export function getEntityId(entity: JsonObject): string | null {
  const id = entity.entity_id ?? entity.entityId ?? entity.id;
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return String(id);
  }
  if (typeof id === 'string' && id.trim()) {
    return id.trim();
  }
  return null;
}

export function getPatientEntityIds(patient: AuthPatient): string[] {
  return patient.entityList
    .map(getEntityId)
    .filter((id): id is string => id !== null);
}

export function parseSession(value: unknown): AuthSession {
  if (
    !isRecord(value) ||
    typeof value.accessToken !== 'string' ||
    !value.accessToken.trim()
  ) {
    throw new Error('Access token was not received from the server');
  }
  const patient = parsePatient(value.patient);
  const ids = getPatientEntityIds(patient);
  const selectedEntityId = value.selectedEntityId;
  if (
    selectedEntityId !== null &&
    (typeof selectedEntityId !== 'string' || !ids.includes(selectedEntityId))
  ) {
    throw new Error('The selected entity is not available for this patient');
  }
  return { accessToken: value.accessToken.trim(), patient, selectedEntityId };
}

export function sessionFromLogin(response: PatientLoginResponse): AuthSession {
  if (!response.success || response.isValid === false) {
    throw new Error(response.message || 'Unable to sign in');
  }
  const patient = parsePatient(response.data);
  return parseSession({
    accessToken: response.data?.accessToken ?? response.accessToken,
    patient,
    selectedEntityId: getPatientEntityIds(patient)[0] ?? null,
  });
}
