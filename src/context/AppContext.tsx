import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

import type {
  User,
  UserRole,
  Patient,
  Doctor,
  Appointment,
  Prescription,
  LabOrder,
  RadiologyOrder,
  Bill,
  Bed,
  Notification,
  MedicationReminder,
  MedicineStock,
  EmergencyCase,
  OTCase,
  InsuranceClaim,
  Vital,
  Document,
  IPDAdmission,
} from '../types';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as mock from '../data/mockData';
import * as mock from '../data/mockData';

interface AppContextType {
  user: User | null;

  login: (role: UserRole) => void;
  isLoggedIn: boolean;
  authLoading: boolean;
  completeLogin: (token?: string) => Promise<void>;
  logout: () => Promise<void>;

  currentPatientId: string;
  setCurrentPatientId: (id: string) => void;

  currentDoctorId: string;

  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  bills: Bill[];
  beds: Bed[];
  notifications: Notification[];
  medicationReminders: MedicationReminder[];
  medicineStock: MedicineStock[];
  emergencyCases: EmergencyCase[];
  otCases: OTCase[];
  insuranceClaims: InsuranceClaim[];
  documents: Document[];

  addAppointment: (apt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>
  ) => void;
  cancelAppointment: (id: string) => void;

  addPrescription: (
    rx: Omit<Prescription, 'id'>
  ) => Prescription;
  updatePrescription: (
    id: string,
    updates: Partial<Prescription>
  ) => void;

  addLabOrder: (
    lab: Omit<LabOrder, 'id'>
  ) => LabOrder;
  updateLabOrder: (
    id: string,
    updates: Partial<LabOrder>
  ) => void;

  addRadiologyOrder: (
    rad: Omit<RadiologyOrder, 'id'>
  ) => RadiologyOrder;
  updateRadiologyOrder: (
    id: string,
    updates: Partial<RadiologyOrder>
  ) => void;

  addBill: (
    bill: Omit<Bill, 'id' | 'invoiceNumber'>
  ) => Bill;
  updateBill: (
    id: string,
    updates: Partial<Bill>
  ) => void;

  updateBed: (
    id: string,
    updates: Partial<Bed>
  ) => void;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  addMedicationReminder: (
    reminder: Omit<MedicationReminder, 'id'>
  ) => void;
  toggleMedicationReminder: (id: string) => void;

  addVital: (
    patientId: string,
    vital: Omit<Vital, 'id' | 'patientId'>
  ) => void;

  addDocument: (
    doc: Omit<Document, 'id'>
  ) => void;

  addEmergencyCase: (
    emg: Omit<EmergencyCase, 'id'>
  ) => void;

  updateEmergencyCase: (
    id: string,
    updates: Partial<EmergencyCase>
  ) => void;

  updateOTCase: (
    id: string,
    updates: Partial<OTCase>
  ) => void;

  updateInsuranceClaim: (
    id: string,
    updates: Partial<InsuranceClaim>
  ) => void;

  addPatient: (
    patient: Omit<Patient, 'id'>
  ) => Patient;

  addDoctor: (
    doctor: Omit<Doctor, 'id'>
  ) => Doctor;

  updateDoctor: (
    id: string,
    updates: Partial<Doctor>
  ) => void;

  admitPatient: (
    patientId: string,
    admission: Omit<IPDAdmission, 'id' | 'patientId'>
  ) => void;

  dischargePatient: (patientId: string) => void;

  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;

  showToast: (
    message: string,
    type?: 'success' | 'error' | 'info'
  ) => void;

  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(
  undefined
);

let idCounter = 1000;

const genId = (prefix: string) => {
  return `${prefix}-${++idCounter}`;
};

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentPatientId, setCurrentPatientId] =
    useState('PAT-001');

  const [currentDoctorId] = useState('DOC-001');

  const [patients, setPatients] = useState(mock.patients);
  const [doctors, setDoctors] = useState(mock.doctors);
  const [appointments, setAppointments] = useState(
    mock.appointments
  );
  const [prescriptions, setPrescriptions] = useState(
    mock.prescriptions
  );
  const [labOrders, setLabOrders] = useState(
    mock.labOrders
  );
  const [radiologyOrders, setRadiologyOrders] = useState(
    mock.radiologyOrders
  );
  const [bills, setBills] = useState(mock.bills);
  const [beds, setBeds] = useState(mock.beds);
  const [notifications, setNotifications] = useState(
    mock.notifications
  );
  const [medicationReminders, setMedicationReminders] =
    useState(mock.medicationReminders);
  const [medicineStock, setMedicineStock] = useState(
    mock.medicineStock
  );
  const [emergencyCases, setEmergencyCases] = useState(
    mock.emergencyCases
  );
  const [otCases, setOtCases] = useState(mock.otCases);
  const [insuranceClaims, setInsuranceClaims] = useState(
    mock.insuranceClaims
  );
  const [documents, setDocuments] = useState(mock.documents);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // -------------------------
  // Toast
  // -------------------------

  // const showToast = useCallback(
  //   (
  //     message: string,
  //     type: 'success' | 'error' | 'info' = 'success'
  //   ) => {
  //     setToast({
  //       message,
  //       type,
  //     });

  //     setTimeout(() => {
  //       setToast(null);
  //     }, 3000);
  //   },
  //   []
  // );
  const showToast = useCallback(
  (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
  ) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
      autoHide: true,
    });
  },
  [],
);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // -------------------------
  // Authentication
  // -------------------------

  const login = useCallback((role: UserRole) => {
    if (role === 'patient') {
      setUser(mock.patientUser);
      setCurrentPatientId('PAT-001');
    } else if (role === 'doctor') {
      setUser(mock.doctorUser);
    } else {
      setUser(mock.adminUser);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      try {
        const [status, token] = await Promise.all([
          AsyncStorage.getItem('is_logged_in'),
          AsyncStorage.getItem('access_token'),
        ]);
        // Successful tokenless OTP verification also creates a local session.
        const valid = status === 'true' &&
          (token === null || token.trim().length > 0);
        if (active && valid) {
          login('patient');
          setIsLoggedIn(true);
        }
      } catch {
        if (active) {
          showToast('Unable to restore your session. Please sign in again.', 'error');
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };
    void restoreSession();
    return () => {
      active = false;
    };
  }, [login, showToast]);

  const completeLogin = useCallback(async (token?: string) => {
    if (token !== undefined && (typeof token !== 'string' || !token.trim())) {
      throw new Error('Invalid access token received from the server');
    }
    // Write the login flag last so a failed token write cannot restore a session.
    await AsyncStorage.removeItem('is_logged_in');
    if (token !== undefined) {
      await AsyncStorage.setItem('access_token', token.trim());
    } else {
      await AsyncStorage.removeItem('access_token');
    }
    await AsyncStorage.setItem('is_logged_in', 'true');
    login('patient');
    setIsLoggedIn(true);
  }, [login]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('is_logged_in');
    await AsyncStorage.removeItem('access_token');
    setUser(null);
    setCurrentPatientId('PAT-001');
    setIsLoggedIn(false);
  }, []);

  // -------------------------
  // Appointments
  // -------------------------

  const addAppointment = useCallback(
    (apt: Omit<Appointment, 'id'>): Appointment => {
      const newApt = {
        ...apt,
        id: genId('APT'),
      };

      setAppointments(prev => [
        newApt,
        ...prev,
      ]);

      setNotifications(prev => [
        {
          id: genId('N'),
          patientId: apt.patientId,
          type: 'appointment',
          title: 'Appointment Confirmed',
          message: `Your appointment with ${apt.doctorName} on ${apt.date} at ${apt.time} is confirmed`,
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        {
          id: genId('N'),
          doctorId: apt.doctorId,
          type: 'appointment',
          title: 'New Appointment',
          message: `${apt.patientName} booked a consultation on ${apt.date} at ${apt.time}`,
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        ...prev,
      ]);

      return newApt;
    },
    []
  );

  const updateAppointment = useCallback(
    (
      id: string,
      updates: Partial<Appointment>
    ) => {
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id
            ? {
                ...appointment,
                ...updates,
              }
            : appointment
        )
      );
    },
    []
  );

  const cancelAppointment = useCallback(
    (id: string) => {
      setAppointments(prev =>
        prev.map(appointment =>
          appointment.id === id
            ? {
                ...appointment,
                status: 'cancelled' as const,
              }
            : appointment
        )
      );
    },
    []
  );

  // -------------------------
  // Prescriptions
  // -------------------------

  const addPrescription = useCallback(
    (
      rx: Omit<Prescription, 'id'>
    ): Prescription => {
      const newRx = {
        ...rx,
        id: genId('RX'),
      };

      setPrescriptions(prev => [
        newRx,
        ...prev,
      ]);

      setNotifications(prev => [
        {
          id: genId('N'),
          patientId: rx.patientId,
          type: 'prescription',
          title: 'New Prescription',
          message: `${rx.doctorName} has prescribed medication for ${rx.diagnosis}`,
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        ...prev,
      ]);

      return newRx;
    },
    []
  );

  const updatePrescription = useCallback(
    (
      id: string,
      updates: Partial<Prescription>
    ) => {
      setPrescriptions(prev =>
        prev.map(prescription =>
          prescription.id === id
            ? {
                ...prescription,
                ...updates,
              }
            : prescription
        )
      );
    },
    []
  );

  // -------------------------
  // Lab Orders
  // -------------------------

  const addLabOrder = useCallback(
    (
      lab: Omit<LabOrder, 'id'>
    ): LabOrder => {
      const newLab = {
        ...lab,
        id: genId('LAB'),
      };

      setLabOrders(prev => [
        newLab,
        ...prev,
      ]);

      setNotifications(prev => [
        {
          id: genId('N'),
          patientId: lab.patientId,
          type: 'lab',
          title: 'Lab Test Ordered',
          message: `${lab.doctorName} ordered ${lab.test} for you`,
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        ...prev,
      ]);

      return newLab;
    },
    []
  );

  const updateLabOrder = useCallback(
    (
      id: string,
      updates: Partial<LabOrder>
    ) => {
      setLabOrders(prev =>
        prev.map(lab =>
          lab.id === id
            ? {
                ...lab,
                ...updates,
              }
            : lab
        )
      );

      if (
        updates.status === 'available' ||
        updates.status === 'verified'
      ) {
        const lab = labOrders.find(
          item => item.id === id
        );

        if (lab) {
          setNotifications(prev => [
            {
              id: genId('N'),
              patientId: lab.patientId,
              type: 'lab',
              title: 'Lab Report Available',
              message: `Your ${lab.test} report is now available`,
              date: new Date()
                .toISOString()
                .split('T')[0],
              read: false,
            },
            {
              id: genId('N'),
              doctorId: lab.doctorId,
              type: 'lab',
              title: 'Lab Report Ready',
              message: `${lab.test} result for ${lab.patientName} is now available`,
              date: new Date()
                .toISOString()
                .split('T')[0],
              read: false,
            },
            ...prev,
          ]);
        }
      }
    },
    [labOrders]
  );

  // -------------------------
  // Radiology
  // -------------------------

  const addRadiologyOrder = useCallback(
    (
      rad: Omit<RadiologyOrder, 'id'>
    ): RadiologyOrder => {
      const newRad = {
        ...rad,
        id: genId('RAD'),
      };

      setRadiologyOrders(prev => [
        newRad,
        ...prev,
      ]);

      return newRad;
    },
    []
  );

  const updateRadiologyOrder = useCallback(
    (
      id: string,
      updates: Partial<RadiologyOrder>
    ) => {
      setRadiologyOrders(prev =>
        prev.map(radiology =>
          radiology.id === id
            ? {
                ...radiology,
                ...updates,
              }
            : radiology
        )
      );
    },
    []
  );

  // -------------------------
  // Bills
  // -------------------------

  const addBill = useCallback(
    (
      bill: Omit<Bill, 'id' | 'invoiceNumber'>
    ): Bill => {
      const newBill = {
        ...bill,
        id: genId('BILL'),
        invoiceNumber: `INV-2024-${String(
          bills.length + 1
        ).padStart(3, '0')}`,
      };

      setBills(prev => [
        newBill,
        ...prev,
      ]);

      return newBill;
    },
    [bills.length]
  );

  const updateBill = useCallback(
    (
      id: string,
      updates: Partial<Bill>
    ) => {
      setBills(prev =>
        prev.map(bill =>
          bill.id === id
            ? {
                ...bill,
                ...updates,
              }
            : bill
        )
      );
    },
    []
  );

  // -------------------------
  // Beds
  // -------------------------

  const updateBed = useCallback(
    (
      id: string,
      updates: Partial<Bed>
    ) => {
      setBeds(prev =>
        prev.map(bed =>
          bed.id === id
            ? {
                ...bed,
                ...updates,
              }
            : bed
        )
      );
    },
    []
  );

  // -------------------------
  // Notifications
  // -------------------------

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    },
    []
  );

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          read: true,
        }))
      );
    }, []);

  // -------------------------
  // Medication Reminders
  // -------------------------

  const addMedicationReminder = useCallback(
    (
      reminder: Omit<MedicationReminder, 'id'>
    ) => {
      setMedicationReminders(prev => [
        ...prev,
        {
          ...reminder,
          id: genId('MR'),
        },
      ]);
    },
    []
  );

  const toggleMedicationReminder =
    useCallback((id: string) => {
      setMedicationReminders(prev =>
        prev.map(reminder =>
          reminder.id === id
            ? {
                ...reminder,
                active: !reminder.active,
              }
            : reminder
        )
      );
    }, []);

  // -------------------------
  // Vitals
  // -------------------------

  const addVital = useCallback(
    (
      patientId: string,
      vital: Omit<Vital, 'id' | 'patientId'>
    ) => {
      const newVital = {
        ...vital,
        id: genId('vital'),
        patientId,
      };

      setPatients(prev =>
        prev.map(patient =>
          patient.id === patientId
            ? {
                ...patient,
                vitals: [
                  newVital,
                  ...patient.vitals,
                ],
              }
            : patient
        )
      );
    },
    []
  );

  // -------------------------
  // Documents
  // -------------------------

  const addDocument = useCallback(
    (doc: Omit<Document, 'id'>) => {
      setDocuments(prev => [
        {
          ...doc,
          id: genId('DOC-FILE'),
        },
        ...prev,
      ]);
    },
    []
  );

  // -------------------------
  // Emergency Cases
  // -------------------------

  const addEmergencyCase = useCallback(
    (emg: Omit<EmergencyCase, 'id'>) => {
      setEmergencyCases(prev => [
        {
          ...emg,
          id: genId('EMG'),
        },
        ...prev,
      ]);
    },
    []
  );

  const updateEmergencyCase = useCallback(
    (
      id: string,
      updates: Partial<EmergencyCase>
    ) => {
      setEmergencyCases(prev =>
        prev.map(emergency =>
          emergency.id === id
            ? {
                ...emergency,
                ...updates,
              }
            : emergency
        )
      );
    },
    []
  );

  // -------------------------
  // OT Cases
  // -------------------------

  const updateOTCase = useCallback(
    (
      id: string,
      updates: Partial<OTCase>
    ) => {
      setOtCases(prev =>
        prev.map(ot =>
          ot.id === id
            ? {
                ...ot,
                ...updates,
              }
            : ot
        )
      );
    },
    []
  );

  // -------------------------
  // Insurance Claims
  // -------------------------

  const updateInsuranceClaim =
    useCallback(
      (
        id: string,
        updates: Partial<InsuranceClaim>
      ) => {
        setInsuranceClaims(prev =>
          prev.map(claim =>
            claim.id === id
              ? {
                  ...claim,
                  ...updates,
                }
              : claim
          )
        );
      },
      []
    );

  // -------------------------
  // Patients
  // -------------------------

  const addPatient = useCallback(
    (
      patient: Omit<Patient, 'id'>
    ): Patient => {
      const newPatient = {
        ...patient,
        id: `PAT-${String(
          patients.length + 1
        ).padStart(3, '0')}`,
      };

      setPatients(prev => [
        ...prev,
        newPatient,
      ]);

      return newPatient;
    },
    [patients.length]
  );

  // -------------------------
  // Doctors
  // -------------------------

  const addDoctor = useCallback(
    (
      doctor: Omit<Doctor, 'id'>
    ): Doctor => {
      const newDoctor = {
        ...doctor,
        id: `DOC-${String(
          doctors.length + 1
        ).padStart(3, '0')}`,
      };

      setDoctors(prev => [
        ...prev,
        newDoctor,
      ]);

      return newDoctor;
    },
    [doctors.length]
  );

  const updateDoctor = useCallback(
    (
      id: string,
      updates: Partial<Doctor>
    ) => {
      setDoctors(prev =>
        prev.map(doctor =>
          doctor.id === id
            ? {
                ...doctor,
                ...updates,
              }
            : doctor
        )
      );
    },
    []
  );

  // -------------------------
  // IPD Admission
  // -------------------------

  const admitPatient = useCallback(
    (
      patientId: string,
      admission: Omit<
        IPDAdmission,
        'id' | 'patientId'
      >
    ) => {
      const newAdmission: IPDAdmission = {
        ...admission,
        id: genId('IPD'),
        patientId,
      };

      setPatients(prev =>
        prev.map(patient =>
          patient.id === patientId
            ? {
                ...patient,
                ipdAdmission: newAdmission,
              }
            : patient
        )
      );

      setBeds(prev =>
        prev.map(bed =>
          bed.bed === admission.bed &&
          bed.room === admission.room
            ? {
                ...bed,
                status: 'occupied' as const,
                patientId,
                patientName: patients.find(
                  patient =>
                    patient.id === patientId
                )?.name,
                admissionDate:
                  admission.admissionDate,
              }
            : bed
        )
      );

      setNotifications(prev => [
        {
          id: genId('N'),
          patientId,
          type: 'ipd',
          title: 'IPD Admission',
          message: `Patient admitted to ${admission.ward}, Room ${admission.room}, Bed ${admission.bed}`,
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        ...prev,
      ]);
    },
    [patients]
  );

  // -------------------------
  // IPD Discharge
  // -------------------------

  const dischargePatient = useCallback(
    (patientId: string) => {
      setPatients(prev =>
        prev.map(patient => {
          if (patient.id !== patientId) {
            return patient;
          }

          const bedId = beds.find(
            bed => bed.patientId === patientId
          )?.id;

          if (bedId) {
            setBeds(prevBeds =>
              prevBeds.map(bed =>
                bed.id === bedId
                  ? {
                      ...bed,
                      status: 'cleaning' as const,
                      patientId: undefined,
                      patientName: undefined,
                      admissionDate: undefined,
                    }
                  : bed
              )
            );
          }

          return {
            ...patient,
            ipdAdmission: null,
          };
        })
      );

      setNotifications(prev => [
        {
          id: genId('N'),
          patientId,
          type: 'discharge',
          title: 'Discharge Summary Available',
          message:
            'Your discharge summary has been generated. Please review it.',
          date: new Date()
            .toISOString()
            .split('T')[0],
          read: false,
        },
        ...prev,
      ]);
    },
    [beds]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        authLoading,
        completeLogin,
        login,
        logout,

        currentPatientId,
        setCurrentPatientId,
        currentDoctorId,

        patients,
        doctors,
        appointments,
        prescriptions,
        labOrders,
        radiologyOrders,
        bills,
        beds,
        notifications,
        medicationReminders,
        medicineStock,
        emergencyCases,
        otCases,
        insuranceClaims,
        documents,

        addAppointment,
        updateAppointment,
        cancelAppointment,

        addPrescription,
        updatePrescription,

        addLabOrder,
        updateLabOrder,

        addRadiologyOrder,
        updateRadiologyOrder,

        addBill,
        updateBill,

        updateBed,

        markNotificationRead,
        markAllNotificationsRead,

        addMedicationReminder,
        toggleMedicationReminder,

        addVital,
        addDocument,

        addEmergencyCase,
        updateEmergencyCase,

        updateOTCase,
        updateInsuranceClaim,

        addPatient,
        addDoctor,
        updateDoctor,

        admitPatient,
        dischargePatient,

        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return context;
}
