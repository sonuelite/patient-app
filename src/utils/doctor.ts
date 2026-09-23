import type {Doctor} from '../types';
import type {PatientDoctor} from '../network/api';

export function mapPatientDoctor(doctor: PatientDoctor): Doctor {
  const fee = doctor.fee === null || doctor.fee === '' ? null : Number(doctor.fee);
  return {
    id: String(doctor.employee_id),
    name: doctor.full_name,
    specialty: doctor.department_name,
    consultationFee: fee !== null && Number.isFinite(fee) ? fee : null,
    active: doctor.status === 'ACTIVE',
    qualification: '',
    experience: null,
    hospital: '',
    languages: [],
    about: '',
    availableDays: [],
    rating: null,
    reviews: [],
    photo: '',
    workingHours: {start: '', end: ''},
  };
}
