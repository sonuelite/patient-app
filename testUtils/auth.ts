import type { AuthSession } from '../src/types/auth';

export const session: AuthSession = {
  accessToken: 'test-token',
  selectedEntityId: 'hospital-a',
  patient: {
    patient_id: 57,
    uuid: 'test-uuid',
    uhid: 'test-uhid',
    first_name: 'Test',
    last_name: 'Patient',
    email: 'patient@example.com',
    phone: '9999999999',
    gender: 'Male',
    photo: null,
    entityList: [{ entity_id: 'hospital-a' }, { entity_id: 'hospital-b' }],
    financeList: [{ name: 'test-finance', details: { enabled: true } }],
  },
};
