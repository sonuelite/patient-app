export type RootStackParamList = {
    SplashScreen: undefined;

    Welcome: undefined;
    LoginScreen: undefined;
    Signup: undefined;
    // Otp: undefined;
      Otp: {
    phone: string;
  };
    // RoleSelect: undefined;

    PatientTabs: undefined;
    // DoctorTabs: undefined;
    // AdminTabs: undefined;
    FamilyMembers: undefined;
};

export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus =
| 'pending'
| 'confirmed'
| 'checked-in'
| 'in-consultation'
| 'completed'
| 'cancelled'
| 'no-show';

export type ConsultationType =
| 'opd'
| 'follow-up'
| 'online'
| 'video'
| 'audio'
| 'physical';

export type LabStatus =
| 'ordered'
| 'collected'
| 'processing'
| 'verified'
| 'completed'
| 'available';

export type RadiologyStatus =
| 'ordered'
| 'scheduled'
| 'completed'
| 'available';

export type BedStatus =
| 'available'
| 'occupied'
| 'reserved'
| 'cleaning'
| 'maintenance'
| 'blocked';

export type BillStatus =
| 'pending'
| 'paid'
| 'insurance'
| 'partial';

export type PrescriptionStatus =
| 'draft'
| 'finalized'
| 'dispensed';

export type TriageLevel =
| 'critical'
| 'emergency'
| 'urgent'
| 'non-urgent';

export type OTStatus =
| 'requested'
| 'approved'
| 'scheduled'
| 'pre-op'
| 'surgery'
| 'recovery'
| 'completed';

export type InsuranceStatus =
| 'pending'
| 'approved'
| 'rejected'
| 'settled';

export type Department =
| 'Cardiology'
| 'Neurology'
| 'Orthopedics'
| 'General Surgery'
| 'Gynecology'
| 'Pediatrics'
| 'Dermatology'
| 'ENT'
| 'Ophthalmology'
| 'Psychiatry'
| 'Internal Medicine'
| 'Emergency';

export interface Patient {
id: string;
name: string;
age: number;
gender: 'Male' | 'Female' | 'Other';
dob: string;
mobile: string;
email: string;
bloodGroup: string;
allergies: string[];
conditions: string[];
medications: string[];
address: string;
city: string;
state: string;
emergencyContact: {
name: string;
relation: string;
phone: string;
};
insurance: {
provider: string;
policyNumber: string;
tpa: string;
} | null;
photo: string;
familyMembers: FamilyMember[];
vitals: Vital[];
ipdAdmission: IPDAdmission | null;
registeredOn: string;
}

export interface FamilyMember {
id: string;
name: string;
relation:
| 'Father'
| 'Mother'
| 'Spouse'
| 'Child'
| 'Dependent';
age: number;
gender: 'Male' | 'Female';
bloodGroup: string;
}

export interface Doctor {
id: string;
name: string;
qualification: string;
specialty: Department;
experience: number;
hospital: string;
consultationFee: number;
languages: string[];
about: string;
availableDays: string[];
rating: number;
reviews: Review[];
photo: string;
active: boolean;
workingHours: {
start: string;
end: string;
};
}

export interface Review {
id: string;
patientName: string;
rating: number;
comment: string;
date: string;
}

export interface Appointment {
id: string;
patientId: string;
patientName: string;
doctorId: string;
doctorName: string;
department: Department;
date: string;
time: string;
consultationType: ConsultationType;
hospital: string;
status: AppointmentStatus;
reason: string;
token: number;
queuePosition?: number;
prescriptionId?: string;
labOrderIds?: string[];
followUpDate?: string;
notes?: string;
}

export interface Prescription {
id: string;
patientId: string;
patientName: string;
doctorId: string;
doctorName: string;
date: string;
diagnosis: string;
medicines: Medicine[];
status: PrescriptionStatus;
followUp?: string;
}

export interface Medicine {
id: string;
name: string;
strength: string;
dosage: string;
frequency: string;
route: string;
duration: string;
instructions: string;
}

export interface LabOrder {
id: string;
patientId: string;
patientName: string;
doctorId: string;
doctorName: string;
test: string;
date: string;
status: LabStatus;
priority: 'routine' | 'urgent' | 'stat';
notes?: string;
result?: string;
verifiedBy?: string;
}

export interface RadiologyOrder {
id: string;
patientId: string;
patientName: string;
doctorId: string;
doctorName: string;
type: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'ECG';
date: string;
status: RadiologyStatus;
priority: 'routine' | 'urgent' | 'stat';
indication?: string;
reportUrl?: string;
}

export interface Vital {
id: string;
patientId: string;
date: string;
bp: string;
pulse: number;
temperature: number;
spo2: number;
weight: number;
height: number;
bmi: number;
bloodSugar: number;
respiratoryRate: number;
painScore: number;
recordedBy: string;
}

export interface Bill {
id: string;
invoiceNumber: string;
patientId: string;
patientName: string;
date: string;
hospital: string;
description: string;
amount: number;
paid: number;
outstanding: number;
status: BillStatus;
items: BillItem[];
}

export interface BillItem {
description: string;
quantity: number;
rate: number;
amount: number;
}

export interface Bed {
id: string;
floor: string;
ward: string;
room: string;
bed: string;
status: BedStatus;
patientId?: string;
patientName?: string;
admissionDate?: string;
}

export interface IPDAdmission {
id: string;
patientId: string;
admissionDate: string;
ward: string;
room: string;
bed: string;
doctorId: string;
doctorName: string;
nurse: string;
diagnosis: string;
treatment: string;
status: 'admitted' | 'discharged';
vitals: Vital[];
medications: string[];
investigations: string[];
progressNotes: ProgressNote[];
timeline: TimelineEvent[];
}

export interface ProgressNote {
id: string;
date: string;
doctorName: string;
note: string;
}

export interface TimelineEvent {
id: string;
date: string;
event: string;
type:
| 'admission'
| 'treatment'
| 'investigation'
| 'round'
| 'recovery'
| 'discharge';
}

export interface DischargeSummary {
id: string;
patientId: string;
patientName: string;
admissionDate: string;
dischargeDate: string;
diagnosis: string;
hospitalCourse: string;
procedures: string[];
medications: string[];
followUp: string;
diet: string;
warningSigns: string[];
doctorName: string;
}

export interface Notification {
id: string;
patientId?: string;
doctorId?: string;
type:
| 'appointment'
| 'doctor'
| 'lab'
| 'prescription'
| 'billing'
| 'pharmacy'
| 'ipd'
| 'discharge'
| 'follow-up'
| 'medication';
title: string;
message: string;
date: string;
read: boolean;
}

export interface MedicationReminder {
id: string;
patientId: string;
medicine: string;
time: string;
frequency: string;
duration: string;
active: boolean;
}

export interface MedicineStock {
id: string;
name: string;
batch: string;
expiry: string;
stock: number;
price: number;
lowStockThreshold: number;
}

export interface EmergencyCase {
id: string;
patientName: string;
arrivalTime: string;
triage: TriageLevel;
doctorId?: string;
doctorName?: string;
status:
| 'waiting'
| 'in-treatment'
| 'admitted'
| 'discharged'
| 'referred';
complaint: string;
}

export interface OTCase {
id: string;
patientName: string;
procedure: string;
surgeon: string;
anesthetist: string;
otStaff: string[];
date: string;
time: string;
status: OTStatus;
otNumber: string;
}

export interface InsuranceClaim {
id: string;
patientName: string;
provider: string;
policyNumber: string;
amount: number;
status: InsuranceStatus;
type: 'pre-auth' | 'claim' | 'settlement';
date: string;
}

export interface User {
id: string;
role: UserRole;
name: string;
email: string;
photo?: string;
permissions?: string[];
}

export interface Document {
id: string;
patientId: string;
name: string;
type: 'PDF' | 'JPG' | 'PNG';
category: 'report' | 'prescription' | 'medical' | 'insurance';
uploadDate: string;
size: string;
}