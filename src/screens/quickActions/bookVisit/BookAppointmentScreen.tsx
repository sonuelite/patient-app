import {useAppSelector} from '../../../store/hooks';
import {selectAccessToken, selectDoctors, selectEntityId, selectPatientId} from '../../../store/selectors';
import {getAllRelatedPatients} from '../../../network/api';
import type {RelatedPatient} from '../../../network/api';
import {getErrorMessage} from '../../../utils/apiError';
import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Banknote,
  Building,
  Check,
  ChevronLeft,
  CreditCard,
  ShieldCheck,
  Smartphone,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';

import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
  Spacing,
} from '../../../constants/theme';
import {Card} from '../../../components/ui/Card';
import {Button} from '../../../components/ui/Button';
import {Chip} from '../../../components/input/Input';
import {
  Avatar,
  Stepper,
} from '../../../components/ui/DataDisplay';
import {useApp} from '../../../context/AppContext';
import {
  DEPARTMENTS,
  TIME_SLOTS,
} from '../../../data/mockData';
import type {
  ConsultationType,
  RootStackParamList,
} from '../../../types';

type BookAppointmentNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'BookAppointment'
  >;

type BookAppointmentRouteProp = RouteProp<
  RootStackParamList,
  'BookAppointment'
>;

type PaymentMethod =
  | 'upi'
  | 'card'
  | 'netbanking'
  | 'cash'
  | 'insurance';

interface PaymentMethodItem {
  id: PaymentMethod;
  label: string;
  icon: LucideIcon;
}

const STEPS = [
  'Department',
  'Doctor',
  'Type',
  'Date',
  'Time',
  'Patient',
  'Reason',
  'Summary',
  'Payment',
  'Confirm',
];

const CONSULTATION_TYPES: ConsultationType[] = [
  'opd',
  'follow-up',
  'online',
  'video',
  'audio',
  'physical',
];

const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'upi',
    label: 'UPI',
    icon: Smartphone,
  },
  {
    id: 'card',
    label: 'Card',
    icon: CreditCard,
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    icon: Building,
  },
  {
    id: 'cash',
    label: 'Cash',
    icon: Banknote,
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: ShieldCheck,
  },
];

const QUICK_REASONS = [
  'Routine checkup',
  'Fever',
  'Follow-up',
  'Consultation',
  'Pain',
];

const getConsultationDescription = (
  type: ConsultationType,
) => {
  switch (type) {
    case 'opd':
      return 'In-person OPD visit';

    case 'follow-up':
      return 'Follow-up consultation';

    case 'online':
      return 'Online text consultation';

    case 'video':
      return 'Video call consultation';

    case 'audio':
      return 'Audio call consultation';

    case 'physical':
      return 'Physical examination';

    default:
      return '';
  }
};

export default function BookAppointmentScreen() {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<BookAppointmentNavigationProp>();

  const route = useRoute<BookAppointmentRouteProp>();

  const doctorId = route.params?.doctorId;
  const initialConsultationType =
    route.params?.consultationType;

  const {
    currentPatientId,
    addAppointment,
    showToast,
  } = useApp();
  const doctors = useAppSelector(selectDoctors);
  const parentPatientId = useAppSelector(selectPatientId);
  const accessToken = useAppSelector(selectAccessToken);
  const entityId = useAppSelector(selectEntityId);
  const [relatedPatients, setRelatedPatients] = useState<RelatedPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [patientsRetry, setPatientsRetry] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setRelatedPatients([]);
    setPatientsError(null);
    if (parentPatientId === null || !accessToken) {
      setLoadingPatients(false);
      setPatientsError('Please sign in again to view family members');
      return () => controller.abort();
    }
    setLoadingPatients(true);
    getAllRelatedPatients(parentPatientId, controller.signal)
      .then(records => {
        if (!controller.signal.aborted) {
          setRelatedPatients(records);
          setPatientId(previous => records.some(item => String(item.patient_id) === previous)
            ? previous : '');
        }
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setPatientsError(getErrorMessage(error, 'Unable to load family members'));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) { setLoadingPatients(false); }
      });
    return () => controller.abort();
  // Reload on hospital changes and explicit retries as well as account changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentPatientId, accessToken, entityId, patientsRetry]));

  const patients = useMemo(() => relatedPatients.map(item => ({
    id: String(item.patient_id),
    name: `${item.first_name} ${item.last_name}`.trim(),
    photo: item.photo ?? undefined,
    uhid: item.uhid,
    relation: item.relation_of,
    gender: item.gender,
  })), [relatedPatients]);

  const initialDoctor = useMemo(
    () =>
      doctors.find(
        doctor => doctor.id === doctorId,
      ),
    [doctors, doctorId],
  );

  const [step, setStep] = useState(
    doctorId ? 2 : 0,
  );

  const [department, setDepartment] =
    useState<string | null>(
      initialDoctor?.specialty ?? null,
    );

  const [
    selectedDoctorId,
    setSelectedDoctorId,
  ] = useState<string | null>(
    doctorId ?? null,
  );

  const [
    consultationType,
    setConsultationType,
  ] = useState<ConsultationType>(
    initialConsultationType ?? 'opd',
  );

  const [date, setDate] = useState(
    new Date(Date.now() + 86400000)
      .toISOString()
      .split('T')[0],
  );

  const [time, setTime] =
    useState<string | null>(null);

  const [patientId, setPatientId] =
    useState(currentPatientId);

  const [reason, setReason] = useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('upi');

  const successAnimation = useRef(
    new Animated.Value(0),
  ).current;

  const appointmentId = useRef(
    `APT-${Date.now().toString().slice(-6)}`,
  ).current;

  const selectedDoctor = doctors.find(
    doctor => doctor.id === selectedDoctorId,
  );

  const selectedPatient = patients.find(
    patient => patient.id === patientId,
  );

  const days = useMemo(
    () =>
      Array.from({length: 7}, (_, index) => {
        const currentDate = new Date(
          Date.now() + index * 86400000,
        );

        return {
          date: currentDate
            .toISOString()
            .split('T')[0],

          label:
            index === 0
              ? 'Today'
              : index === 1
                ? 'Tomorrow'
                : currentDate.toLocaleDateString(
                    'en-US',
                    {
                      weekday: 'short',
                      day: 'numeric',
                    },
                  ),
        };
      }),
    [],
  );

  const filteredDoctors = useMemo(() => {
    if (!department) {
      return doctors.filter(
        doctor => doctor.active,
      );
    }

    return doctors.filter(
      doctor =>
        doctor.active &&
        doctor.specialty === department,
    );
  }, [doctors, department]);

  const handleBackPress = () => {
    // if (step > 0 && step < 9) {
    if (step > 2 && step < 9) {
      setStep(previousStep => previousStep - 1);
      return;
    }

    navigation.goBack();
  };

  const handleNext = () => {
    if (step === 0 && !department) {
      showToast(
        'Please select a department',
        'error',
      );
      return;
    }

    if (step === 1 && !selectedDoctorId) {
      showToast(
        'Please select a doctor',
        'error',
      );
      return;
    }

    if (step === 4 && !time) {
      showToast(
        'Please select a time slot',
        'error',
      );
      return;
    }

    if (step === 5 && (loadingPatients || patientsError || !selectedPatient)) {
      showToast(
        'Please select a patient',
        'error',
      );
      return;
    }

    if (step === 6 && !reason.trim()) {
      showToast(
        'Please enter reason for visit',
        'error',
      );
      return;
    }

    if (step < STEPS.length - 1) {
      setStep(previousStep => previousStep + 1);
    }
  };

  const handleConfirm = () => {
    if (
      !selectedDoctorId ||
      !selectedDoctor ||
      !selectedPatient ||
      !time
    ) {
      showToast(
        'Appointment details are incomplete',
        'error',
      );
      return;
    }

    addAppointment({
      patientId,
      patientName: selectedPatient.name,
      doctorId: selectedDoctorId,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.specialty,
      date,
      time,
      consultationType,
      hospital:
        selectedDoctor.hospital ||
        'MediCare Health',
      status: 'confirmed',
      reason: reason.trim(),
      token:
        Math.floor(Math.random() * 30) + 1,
    });

    setStep(9);

    requestAnimationFrame(() => {
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    showToast(
      'Appointment booked successfully',
      'success',
    );
  };

  const handleViewAppointment = () => {
    navigation.navigate('PatientTabs', {
      screen: 'Appointments',
    });
  };

  const handleDone = () => {
    navigation.navigate('PatientTabs', {
      screen: 'Home',
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.header,
          {
            paddingTop:
              insets.top + Spacing.md,
          },
        ]}>
        <View style={styles.headerRow}>
          {step < 9 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBackPress}
              style={styles.backButton}>
              <ChevronLeft
                size={24}
                color={Colors.neutral[900]}
              />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.title}>
            Book Appointment
          </Text>
        </View>

        {step < 9 ? (
          <Stepper
            steps={STEPS}
            current={step}
          />
        ) : null}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Department */}

        {step === 0 ? (
          <View>
            <Text style={styles.stepTitle}>
              Select Department
            </Text>

            <View style={styles.gridRow}>
              {DEPARTMENTS.map(item => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDepartment(item);
                    setSelectedDoctorId(null);
                    setStep(1);
                  }}
                  style={[
                    styles.selectCard,
                    department === item &&
                      styles.selectCardActive,
                  ]}>
                  <Text
                    style={[
                      styles.selectText,
                      department === item &&
                        styles.selectTextActive,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Doctor */}

        {step === 1 ? (
          <View>
            <Text style={styles.stepTitle}>
              Select Doctor
            </Text>

            {filteredDoctors.map(doctor => (
              <TouchableOpacity
                key={doctor.id}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedDoctorId(doctor.id);
                  setDepartment(doctor.specialty);
                  setStep(2);
                }}
                style={[
                  styles.doctorSelect,
                  selectedDoctorId === doctor.id &&
                    styles.doctorSelectActive,
                ]}>
                <Avatar
                  uri={doctor.photo}
                  size={48}
                  name={doctor.name}
                />

                <View
                  style={styles.doctorSelectInfo}>
                  <Text
                    style={styles.doctorSelectName}>
                    {doctor.name}
                  </Text>

                  <Text
                    style={styles.doctorSelectSpec}>
                    {doctor.specialty} ·{' '}
                    {doctor.experience === null ? 'Experience unavailable' : `${doctor.experience}y exp`}
                  </Text>

                  <Text
                    style={styles.doctorSelectFee}>
                    {doctor.consultationFee === null ? 'Fee unavailable' : `₹${doctor.consultationFee}`}
                  </Text>
                </View>

                {selectedDoctorId === doctor.id ? (
                  <Check
                    size={22}
                    color={Colors.primary[600]}
                  />
                ) : null}
              </TouchableOpacity>
            ))}

            {filteredDoctors.length === 0 ? (
              <Text style={styles.emptyText}>
                No active doctors found in this
                department.
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Consultation type */}

        {step === 2 ? (
          <View>
            <Text style={styles.stepTitle}>
              Consultation Type
            </Text>

            {CONSULTATION_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                activeOpacity={0.7}
                onPress={() => {
                  setConsultationType(type);
                  setStep(3);
                }}
                style={[
                  styles.typeCard,
                  consultationType === type &&
                    styles.typeCardActive,
                ]}>
                <Text
                  style={[
                    styles.typeText,
                    consultationType === type &&
                      styles.typeTextActive,
                  ]}>
                  {type.toUpperCase()}
                </Text>

                <Text style={styles.typeDescription}>
                  {getConsultationDescription(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Date */}

        {step === 3 ? (
          <View>
            <Text style={styles.stepTitle}>
              Select Date
            </Text>

            <View style={styles.dateRow}>
              {days.map(day => (
                <TouchableOpacity
                  key={day.date}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDate(day.date);
                    setTime(null);
                    setStep(4);
                  }}
                  style={[
                    styles.dateCard,
                    date === day.date &&
                      styles.dateCardActive,
                  ]}>
                  <Text
                    style={[
                      styles.dateLabel,
                      date === day.date &&
                        styles.dateLabelActive,
                    ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Time */}

        {step === 4 ? (
          <View>
            <Text style={styles.stepTitle}>
              Select Time Slot
            </Text>

            <View style={styles.slotsGrid}>
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.7}
                  onPress={() => {
                    setTime(slot);
                    setStep(5);
                  }}
                  style={[
                    styles.slot,
                    time === slot &&
                      styles.slotSelected,
                  ]}>
                  <Text
                    style={[
                      styles.slotText,
                      time === slot &&
                        styles.slotTextSelected,
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Patient */}

        {step === 5 ? (
          <View>
            <Text style={styles.stepTitle}>
              Select Patient
            </Text>

            {loadingPatients ? (
              <ActivityIndicator size="large" color={Colors.primary[600]} />
            ) : patientsError ? (
              <View>
                <Text style={styles.patientId}>{patientsError}</Text>
                <Button label="Retry" onPress={() => setPatientsRetry(value => value + 1)} />
              </View>
            ) : patients.length === 0 ? (
              <Text style={styles.patientId}>No patients found.</Text>
            ) : null}

            {patients.map(patient => (
              <TouchableOpacity
                key={patient.id}
                activeOpacity={0.7}
                onPress={() => {
                  setPatientId(patient.id);
                  setStep(6);
                }}
                style={[
                  styles.patientCard,
                  patientId === patient.id &&
                    styles.patientCardActive,
                ]}>
                <Avatar
                  uri={patient.photo}
                  size={44}
                  name={patient.name}
                />

                <View
                  style={styles.doctorSelectInfo}>
                  <Text style={styles.patientName}>
                    {patient.name}
                  </Text>

                  <Text style={styles.patientId}>
                    {patient.uhid} · {patient.gender} · {patient.relation}
                  </Text>
                </View>

                {patientId === patient.id ? (
                  <Check
                    size={22}
                    color={Colors.primary[600]}
                  />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Reason */}

        {step === 6 ? (
          <View>
            <Text style={styles.stepTitle}>
              Reason for Visit
            </Text>

            <Card style={styles.reasonCard}>
              <TextInput
                style={styles.reasonInput}
                placeholder="Describe your symptoms or reason for visit..."
                placeholderTextColor={
                  Colors.neutral[400]
                }
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </Card>

            <View style={styles.quickReasons}>
              {QUICK_REASONS.map(item => (
                <Chip
                  key={item}
                  label={item}
                  selected={reason === item}
                  onPress={() => setReason(item)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {/* Summary */}

        {step === 7 ? (
          <View>
            <Text style={styles.stepTitle}>
              Appointment Summary
            </Text>

            <Card style={styles.summaryCard}>
              <SummaryRow
                label="Department"
                value={
                  selectedDoctor?.specialty ||
                  department ||
                  '-'
                }
              />

              <SummaryRow
                label="Doctor"
                value={selectedDoctor?.name || '-'}
              />

              <SummaryRow
                label="Type"
                value={consultationType.toUpperCase()}
              />

              <SummaryRow
                label="Date"
                value={date}
              />

              <SummaryRow
                label="Time"
                value={time || '-'}
              />

              <SummaryRow
                label="Patient"
                value={selectedPatient?.name || '-'}
              />

              <SummaryRow
                label="Reason"
                value={reason}
              />

              <View style={styles.summaryDivider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Fee
                </Text>

                <Text
                  style={styles.summaryValueBold}>
                  {selectedDoctor?.consultationFee == null ? 'Fee unavailable' : `₹${selectedDoctor.consultationFee}`}
                </Text>
              </View>
            </Card>
          </View>
        ) : null}

        {/* Payment */}

        {step === 8 ? (
          <View>
            <Text style={styles.stepTitle}>
              Mock Payment
            </Text>

            <Card style={styles.paymentAmountCard}>
              <Text
                style={styles.paymentAmountLabel}>
                Amount to Pay
              </Text>

              <Text style={styles.paymentAmount}>
                {selectedDoctor?.consultationFee == null ? 'Fee unavailable' : `₹${selectedDoctor.consultationFee}`}
              </Text>
            </Card>

            <Text style={styles.paymentLabel}>
              Select Payment Method
            </Text>

            {PAYMENT_METHODS.map(method => {
              const PaymentIcon = method.icon;
              const isSelected =
                paymentMethod === method.id;

              return (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.7}
                  onPress={() =>
                    setPaymentMethod(method.id)
                  }
                  style={[
                    styles.paymentMethod,
                    isSelected &&
                      styles.paymentMethodActive,
                  ]}>
                  <PaymentIcon
                    size={22}
                    color={
                      isSelected
                        ? Colors.primary[600]
                        : Colors.neutral[400]
                    }
                  />

                  <Text
                    style={[
                      styles.paymentMethodText,
                      isSelected &&
                        styles.paymentMethodTextActive,
                    ]}>
                    {method.label}
                  </Text>

                  {isSelected ? (
                    <Check
                      size={20}
                      color={Colors.primary[600]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Confirmation */}

        {step === 9 ? (
          <View style={styles.confirmContainer}>
            <Animated.View
              style={[
                styles.checkCircle,
                {
                  transform: [
                    {
                      scale:
                        successAnimation.interpolate(
                          {
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          },
                        ),
                    },
                  ],
                },
              ]}>
              <Check
                size={48}
                color={Colors.neutral[0]}
                strokeWidth={3}
              />
            </Animated.View>

            <Text style={styles.confirmTitle}>
              Appointment Confirmed!
            </Text>

            <Text style={styles.confirmSubtitle}>
              Your appointment has been booked
              successfully
            </Text>

            <Card style={styles.confirmCard}>
              <SummaryRow
                label="Appointment ID"
                value={appointmentId}
              />

              <SummaryRow
                label="Doctor"
                value={selectedDoctor?.name || '-'}
              />

              <SummaryRow
                label="Department"
                value={
                  selectedDoctor?.specialty ||
                  department ||
                  '-'
                }
              />

              <SummaryRow
                label="Date & Time"
                value={`${date} · ${time || '-'}`}
              />

              <SummaryRow
                label="Mode"
                value={consultationType.toUpperCase()}
              />

              <SummaryRow
                label="Patient"
                value={selectedPatient?.name || '-'}
              />
            </Card>

            <View style={styles.confirmActions}>
              <Button
                label="View Appointment"
                onPress={handleViewAppointment}
                variant="primary"
                size="md"
              />

              <Button
                label="Done"
                onPress={handleDone}
                variant="outline"
                size="md"
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {step < 9 ? (
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom:
                insets.bottom + Spacing.sm,
            },
          ]}>
          <Button
            label={
              step === 8
                ? 'Pay & Confirm'
                : 'Continue'
            }
            onPress={
              step === 8
                ? handleConfirm
                : handleNext
            }
            fullWidth
            size="lg"
            icon={
              step === 8 ? (
                <Check
                  size={20}
                  color={Colors.neutral[0]}
                />
              ) : undefined
            }
          />
        </View>
      ) : null}
    </View>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: 120,
  },
  stepTitle: {
    marginBottom: Spacing.md,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  selectCard: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  selectCardActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  selectText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  selectTextActive: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  doctorSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  doctorSelectActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  doctorSelectInfo: {
    flex: 1,
  },
  doctorSelectName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  doctorSelectSpec: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  doctorSelectFee: {
    marginTop: 2,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  emptyText: {
    marginTop: Spacing.lg,
    fontSize: FontSize.base,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  typeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  typeCardActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  typeText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  typeTextActive: {
    color: Colors.primary[700],
  },
  typeDescription: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dateCard: {
    minWidth: '30%',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  dateCardActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  dateLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
  },
  dateLabelActive: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slot: {
    minWidth: '23%',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  slotSelected: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },
  slotText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
  },
  slotTextSelected: {
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  patientCardActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  patientName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  patientId: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  reasonCard: {
    marginBottom: Spacing.md,
  },
  reasonInput: {
    minHeight: 120,
    padding: 0,
    fontSize: FontSize.base,
    color: Colors.neutral[900],
  },
  quickReasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
  },
  summaryValue: {
    flex: 1,
    marginLeft: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[900],
    textAlign: 'right',
  },
  summaryValueBold: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  summaryDivider: {
    height: 1,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.neutral[100],
  },
  paymentAmountCard: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  paymentAmountLabel: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
  },
  paymentAmount: {
    marginTop: Spacing.sm,
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: Colors.primary[700],
  },
  paymentLabel: {
    marginBottom: Spacing.md,
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  paymentMethodActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  paymentMethodText: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[700],
  },
  paymentMethodTextActive: {
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
  confirmContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.success[600],
    borderRadius: 40,
  },
  confirmTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
  },
  confirmSubtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  confirmCard: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  confirmActions: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  bottomBar: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    backgroundColor: Colors.neutral[0],
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
});
