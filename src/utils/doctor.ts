import type {Doctor} from '../types';
import type {PatientDoctor} from '../network/api';

export function mapPatientDoctor(doctor: PatientDoctor): Doctor {
  const fee = doctor.fee === null || doctor.fee === '' ? null : Number(doctor.fee);
  const experience = doctor.experience == null || doctor.experience === ''
    ? null
    : Number(doctor.experience);
  return {
    id: String(doctor.employee_id),
    departmentId: doctor.dept_id ?? doctor.department_id,
    name: doctor.full_name,
    specialty: doctor.department_name,
    consultationFee: fee !== null && Number.isFinite(fee) ? fee : null,
    active: doctor.status === 'ACTIVE',
    qualification: doctor.qualification ?? '',
    experience: experience !== null && Number.isFinite(experience) ? experience : null,
    hospital: doctor.hospital_name || doctor.entity_name || '',
    languages: doctor.languages ?? [],
    about: doctor.about ?? '',
    availableDays: doctor.available_days ?? [],
    timeSlots: doctor.time_slots ?? [],
    rating: null,
    reviews: [],
    photo: doctor.employee_photo ?? '',
    workingHours: {start: '', end: ''},
  };
}
