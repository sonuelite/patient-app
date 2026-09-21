import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
} from '../../../constants/theme';

import {
  Card,
  Badge,
  SectionHeader,
} from '../../../components/ui/Card';

import {
  StatusBadge,
} from '../../../components/ui/DataDisplay';


import {
  StatTile,
  InfoRow,
  SectionCard,
} from '../../../components/ui/Widgets';

import {
  Bell,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  ShoppingBag,
  Siren,
  Stethoscope,
  Video,
  ChevronRight,
  Heart,
  Droplet,
  Wind,
  Clock,
  CheckCircle,
  AlertCircle,
  Syringe,
  BedDouble,
  UserCheck,
  MapPin,
} from 'lucide-react-native';

import {useApp} from '../../../context/AppContext';

export default function PatientHomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentPatientId,
    patients,
    appointments,
    prescriptions,
    labOrders,
    bills,
    notifications,
    medicationReminders,
  } = useApp();

  const patient =
    patients.find(p => p.id === currentPatientId) || patients[0];

  const upcomingAppt = appointments.find(
    a =>
      a.patientId === patient.id &&
      (a.status === 'confirmed' || a.status === 'checked-in'),
  );

  const latestRx = prescriptions.find(
    p => p.patientId === patient.id,
  );

  const latestLab = labOrders.find(
    l => l.patientId === patient.id,
  );

  const latestBill = bills.find(
    b => b.patientId === patient.id,
  );

  const unreadCount = notifications.filter(
    n => n.patientId === patient.id && !n.read,
  ).length;

  const latestVital = patient.vitals[0];

  const activeMeds = medicationReminders.filter(
    m => m.patientId === patient.id && m.active,
  );

  const pendingLabs = labOrders.filter(
    l =>
      l.patientId === patient.id &&
      (l.status === 'ordered' ||
        l.status === 'collected' ||
        l.status === 'processing'),
  );

  const unpaidBills = bills.filter(
    b => b.patientId === patient.id && b.status !== 'paid',
  );

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? 'Good Morning'
      : hour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  const goTo = (screen: string, params?: any) => {
    navigation.navigate(screen, params);
  };

  const quickActions = [
    {
      label: 'Book Visit',
      icon: Calendar,
      color: Colors.primary[600],
      route: 'FindDoctor',
    },
    {
      label: 'Find Doctor',
      icon: Stethoscope,
      color: Colors.success[600],
      route: 'FindDoctor',
    },
    {
      label: 'My Records',
      icon: FileText,
      color: Colors.accent[600],
      route: 'Records',
    },
    {
      label: 'Pharmacy',
      icon: ShoppingBag,
      color: Colors.teal[600],
      route: 'Pharmacy',
    },
    {
      label: 'Lab Tests',
      icon: FlaskConical,
      color: Colors.warning[600],
      route: 'Records',
    },
    {
      label: 'Billing',
      icon: Receipt,
      color: Colors.secondary[600],
      route: 'Billing',
    },
    {
      label: 'Emergency',
      icon: Siren,
      color: Colors.error[600],
      route: 'Emergency',
    },
    {
      label: 'My Profile',
      icon: UserCheck,
      color: Colors.neutral[600],
      route: 'Profile',
    },
  ];

  const apptSteps = upcomingAppt
    ? [
        {
          step: 'Booked',
          done: true,
        },
        {
          step: 'Confirmed',
          done:
            upcomingAppt.status === 'confirmed' ||
            upcomingAppt.status === 'checked-in',
        },
        {
          step: 'Check-In',
          done: upcomingAppt.status === 'checked-in',
        },
        {
          step: 'Consult',
          done: false,
        },
      ]
    : [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.md,
            },
          ]}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                {greeting},
              </Text>

              <Text style={styles.patientName}>
                {patient.name}
              </Text>

              <View style={styles.headerIdRow}>
                <Text style={styles.patientId}>
                  ID: {patient.id}
                </Text>

                <View style={styles.bloodBadge}>
                  <Droplet
                    size={10}
                    color={Colors.error[500]}
                  />

                  <Text style={styles.bloodText}>
                    {patient.bloodGroup}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => goTo('Notifications')}
                style={styles.bellWrap}>
                <Bell
                  size={22}
                  color={Colors.neutral[0]}
                />

                {unreadCount > 0 && (
                  <View style={styles.bellDot}>
                    <Text style={styles.bellDotText}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goTo('Profile')}>
                <Image
                  source={{uri: patient.photo}}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.body}>

          {/* Health Snapshot */}
          <View style={styles.healthBar}>
            <StatTile
              label="Blood Pressure"
              value={latestVital ? latestVital.bp : '--'}
              icon={
                <Heart
                  size={18}
                  color={Colors.error[600]}
                />
              }
              color="error"
              size="sm"
            />

            <StatTile
              label="SpO2"
              value={
                latestVital
                  ? `${latestVital.spo2}%`
                  : '--'
              }
              icon={
                <Wind
                  size={18}
                  color={Colors.teal[600]}
                />
              }
              color="teal"
              size="sm"
            />

            <StatTile
              label="Blood Sugar"
              value={
                latestVital
                  ? `${latestVital.bloodSugar}`
                  : '--'
              }
              icon={
                <Droplet
                  size={18}
                  color={Colors.accent[600]}
                />
              }
              color="accent"
              size="sm"
            />
          </View>

          {/* Upcoming Appointment */}
          {upcomingAppt && (
            <>
              <SectionHeader
                title="Upcoming Appointment"
                action="Details"
                onAction={() =>
                  goTo('AppointmentDetail', {
                    id: upcomingAppt.id,
                  })
                }
              />

              <Card
                onPress={() =>
                  goTo('AppointmentDetail', {
                    id: upcomingAppt.id,
                  })
                }
                style={styles.apptCard}
                shadow="md">

                <View style={styles.apptTop}>
                  <View style={styles.apptDoctorInfo}>
                    <Text style={styles.apptDoctorName}>
                      {upcomingAppt.doctorName}
                    </Text>

                    <Text style={styles.apptSpec}>
                      {upcomingAppt.department}
                    </Text>
                  </View>

                  <StatusBadge
                    status={upcomingAppt.status}
                  />
                </View>

                <View style={styles.apptDetails}>
                  <View style={styles.apptDetailItem}>
                    <Calendar
                      size={14}
                      color={Colors.neutral[400]}
                    />

                    <Text style={styles.apptDetailText}>
                      {upcomingAppt.date} ·{' '}
                      {upcomingAppt.time}
                    </Text>
                  </View>

                  <View style={styles.apptDetailItem}>
                    {upcomingAppt.consultationType ===
                      'video' ||
                    upcomingAppt.consultationType ===
                      'online' ? (
                      <Video
                        size={14}
                        color={Colors.primary[600]}
                      />
                    ) : (
                      <Stethoscope
                        size={14}
                        color={Colors.neutral[400]}
                      />
                    )}

                    <Text style={styles.apptDetailText}>
                      {upcomingAppt.consultationType.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.apptDetailItem}>
                    <MapPin
                      size={14}
                      color={Colors.neutral[400]}
                    />

                    <Text style={styles.apptDetailText}>
                      {upcomingAppt.hospital}
                    </Text>
                  </View>
                </View>

                {/* Appointment Stepper */}
                <View style={styles.stepperRow}>
                  {apptSteps.map((s, i) => (
                    <View
                      key={i}
                      style={styles.stepItem}>

                      <View
                        style={[
                          styles.stepCircle,
                          s.done &&
                            styles.stepCircleDone,
                        ]}>
                        {s.done ? (
                          <CheckCircle
                            size={14}
                            color="#fff"
                          />
                        ) : (
                          <Text
                            style={styles.stepNum}>
                            {i + 1}
                          </Text>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.stepLabel,
                          s.done &&
                            styles.stepLabelDone,
                        ]}>
                        {s.step}
                      </Text>

                      {i <
                        apptSteps.length - 1 && (
                        <View
                          style={[
                            styles.stepLine,
                            s.done &&
                              styles.stepLineDone,
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </View>

                {/* Appointment Actions */}
                <View style={styles.apptActions}>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() =>
                      goTo('AppointmentDetail', {
                        id: upcomingAppt.id,
                      })
                    }>
                    <Text style={styles.viewBtnText}>
                      View Details
                    </Text>
                  </TouchableOpacity>

                  {upcomingAppt.status ===
                    'confirmed' && (
                    <TouchableOpacity
                      style={styles.joinBtn}
                      onPress={() =>
                        goTo('AppointmentDetail', {
                          id: upcomingAppt.id,
                        })
                      }>
                      <UserCheck
                        size={14}
                        color="#fff"
                      />

                      <Text
                        style={styles.joinBtnText}>
                        Check In
                      </Text>
                    </TouchableOpacity>
                  )}

                  {(upcomingAppt.consultationType ===
                    'video' ||
                    upcomingAppt.consultationType ===
                      'online') &&
                    upcomingAppt.status ===
                      'checked-in' && (
                      <TouchableOpacity
                        style={styles.joinBtn}
                        onPress={() =>
                          goTo('Consultation', {
                            id: upcomingAppt.id,
                          })
                        }>
                        <Video
                          size={14}
                          color="#fff"
                        />

                        <Text
                          style={styles.joinBtnText}>
                          Join Call
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>
              </Card>
            </>
          )}

          {/* Active Medications */}
          {activeMeds.length > 0 && (
            <>
              <SectionHeader
                title="Active Medications"
                action="View All"
                onAction={() =>
                  goTo('MedicationReminders')
                }
              />

              <SectionCard
                title="Today's Schedule"
                icon={
                  <Pill
                    size={16}
                    color={Colors.primary[600]}
                  />
                }>

                {activeMeds
                  .slice(0, 3)
                  .map((med, i) => (
                    <View
                      key={i}
                      style={styles.medItem}>

                      <View style={styles.medIcon}>
                        <Syringe
                          size={16}
                          color={
                            Colors.primary[600]
                          }
                        />
                      </View>

                      <View style={styles.medInfo}>
                        <Text
                          style={styles.medName}>
                          {med.medicine}
                        </Text>

                        <Text
                          style={styles.medDose}>
                          {med.frequency} ·{' '}
                          {med.duration}
                        </Text>
                      </View>

                      <View style={styles.medTime}>
                        <Clock
                          size={12}
                          color={
                            Colors.warning[600]
                          }
                        />

                        <Text
                          style={styles.medTimeText}>
                          {med.time}
                        </Text>
                      </View>
                    </View>
                  ))}
              </SectionCard>
            </>
          )}

          {/* Quick Actions */}
          <SectionHeader title="Quick Actions" />

          <View style={styles.quickGrid}>
            {quickActions.map((action, i) => {
              const Icon = action.icon;

              return (
                <TouchableOpacity
                  key={i}
                  style={styles.quickItem}
                  onPress={() =>
                    goTo(action.route)
                  }
                  activeOpacity={0.8}>

                  <View
                    style={[
                      styles.quickIcon,
                      {
                        backgroundColor:
                          action.color + '15',
                      },
                    ]}>
                    <Icon
                      size={22}
                      color={action.color}
                    />
                  </View>

                  <Text style={styles.quickLabel}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pending Lab Tests */}
          {pendingLabs.length > 0 && (
            <>
              <SectionHeader
                title="Pending Lab Tests"
                action="View All"
                onAction={() =>
                  goTo('Records')
                }
              />

              <SectionCard
                title="Lab Work"
                icon={
                  <FlaskConical
                    size={16}
                    color={Colors.warning[600]}
                  />
                }>

                {pendingLabs
                  .slice(0, 3)
                  .map((lab, i) => (
                    <View
                      key={i}
                      style={styles.labItem}>

                      <View
                        style={[
                          styles.labIcon,
                          {
                            backgroundColor:
                              Colors.warning[50],
                          },
                        ]}>
                        <FlaskConical
                          size={16}
                          color={
                            Colors.warning[600]
                          }
                        />
                      </View>

                      <View style={styles.labInfo}>
                        <Text
                          style={styles.labName}>
                          {lab.test}
                        </Text>

                        <Text
                          style={styles.labDate}>
                          Ordered: {lab.date}
                        </Text>
                      </View>

                      <StatusBadge
                        status={lab.status}
                      />
                    </View>
                  ))}
              </SectionCard>
            </>
          )}

          {/* Recent Activity */}
          <SectionHeader title="Recent Activity" />

          <View style={styles.recentList}>
            {latestRx && (
              <Card
                style={styles.recentCard}
                onPress={() => goTo('Records')}
                shadow="sm">

                <View
                  style={[
                    styles.recentIcon,
                    {
                      backgroundColor:
                        Colors.primary[50],
                    },
                  ]}>
                  <Pill
                    size={18}
                    color={Colors.primary[600]}
                  />
                </View>

                <View style={styles.recentInfo}>
                  <Text
                    style={styles.recentTitle}>
                    Prescription
                  </Text>

                  <Text
                    style={styles.recentDesc}>
                    {latestRx.diagnosis} ·{' '}
                    {latestRx.date}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={Colors.neutral[300]}
                />
              </Card>
            )}

            {latestLab && (
              <Card
                style={styles.recentCard}
                onPress={() => goTo('Records')}
                shadow="sm">

                <View
                  style={[
                    styles.recentIcon,
                    {
                      backgroundColor:
                        Colors.warning[50],
                    },
                  ]}>
                  <FlaskConical
                    size={18}
                    color={Colors.warning[600]}
                  />
                </View>

                <View style={styles.recentInfo}>
                  <Text
                    style={styles.recentTitle}>
                    Lab Report
                  </Text>

                  <Text
                    style={styles.recentDesc}>
                    {latestLab.test} ·{' '}
                    {latestLab.status}
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={Colors.neutral[300]}
                />
              </Card>
            )}

            {latestBill && (
              <Card
                style={styles.recentCard}
                onPress={() => goTo('Billing')}
                shadow="sm">

                <View
                  style={[
                    styles.recentIcon,
                    {
                      backgroundColor:
                        Colors.secondary[50],
                    },
                  ]}>
                  <Receipt
                    size={18}
                    color={Colors.secondary[600]}
                  />
                </View>

                <View style={styles.recentInfo}>
                  <Text
                    style={styles.recentTitle}>
                    Payment
                  </Text>

                  <Text
                    style={styles.recentDesc}>
                    {latestBill.invoiceNumber} · ₹
                    {latestBill.outstanding} due
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={Colors.neutral[300]}
                />
              </Card>
            )}
          </View>

          {/* IPD Stay */}
          {patient.ipdAdmission && (
            <>
              <SectionHeader
                title="My Hospital Stay"
                action="View"
                onAction={() =>
                  goTo('IPD')
                }
              />

              <Card
                onPress={() => goTo('IPD')}
                style={styles.ipdCard}
                shadow="md">

                <View style={styles.ipdHeader}>
                  <View style={styles.ipdTitleRow}>
                    <View style={styles.ipdIcon}>
                      <BedDouble
                        size={18}
                        color={
                          Colors.error[600]
                        }
                      />
                    </View>

                    <Text
                      style={styles.ipdTitle}>
                      Currently Admitted
                    </Text>
                  </View>

                  <Badge
                    label="IPD"
                    color="error"
                    size="md"
                  />
                </View>

                <View style={styles.ipdInfoBox}>
                  <InfoRow
                    icon={
                      <MapPin
                        size={14}
                        color={
                          Colors.neutral[600]
                        }
                      />
                    }
                    label="Ward"
                    value={
                      patient.ipdAdmission.ward
                    }
                  />

                  <InfoRow
                    icon={
                      <BedDouble
                        size={14}
                        color={
                          Colors.neutral[600]
                        }
                      />
                    }
                    label="Room/Bed"
                    value={`${patient.ipdAdmission.room} / ${patient.ipdAdmission.bed}`}
                  />

                  <InfoRow
                    icon={
                      <Stethoscope
                        size={14}
                        color={
                          Colors.neutral[600]
                        }
                      />
                    }
                    label="Attending"
                    value={
                      patient.ipdAdmission
                        .doctorName
                    }
                  />

                  <InfoRow
                    icon={
                      <AlertCircle
                        size={14}
                        color={
                          Colors.neutral[600]
                        }
                      />
                    }
                    label="Diagnosis"
                    value={
                      patient.ipdAdmission
                        .diagnosis
                    }
                  />
                </View>
              </Card>
            </>
          )}

          {/* Unpaid Bills */}
          {unpaidBills.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => goTo('Billing')}>

              <View style={styles.billAlert}>
                <View style={styles.billAlertIcon}>
                  <Receipt
                    size={20}
                    color={
                      Colors.warning[700]
                    }
                  />
                </View>

                <View style={styles.billAlertInfo}>
                  <Text
                    style={styles.billAlertTitle}>
                    {unpaidBills.length} Pending Bill
                    {unpaidBills.length > 1
                      ? 's'
                      : ''}
                  </Text>

                  <Text
                    style={styles.billAlertDesc}>
                    Total: ₹
                    {unpaidBills.reduce(
                      (sum, bill) =>
                        sum + bill.outstanding,
                      0,
                    )}{' '}
                    outstanding
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color={Colors.warning[700]}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Emergency FAB */}
      <TouchableOpacity
        style={styles.emergencyFab}
        onPress={() => goTo('Emergency')}
        activeOpacity={0.85}>

        <Siren
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  header: {
    backgroundColor: Colors.primary[700],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    ...Shadows.lg,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLeft: {
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  greeting: {
    fontSize: FontSize.base,
    color: Colors.primary[200],
    fontWeight: FontWeight.medium,
  },

  patientName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral[0],
  },

  headerIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },

  patientId: {
    fontSize: FontSize.xs,
    color: Colors.primary[300],
    fontWeight: FontWeight.medium,
  },

  bloodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },

  bloodText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[0],
    fontWeight: FontWeight.semibold,
  },

  bellWrap: {
    padding: Spacing.sm,
    position: 'relative',
  },

  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  bellDotText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: FontWeight.bold,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },

  body: {
    padding: Spacing.base,
    paddingTop: Spacing.md,
  },

  healthBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  apptCard: {
    marginBottom: Spacing.md,
  },

  apptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },

  apptDoctorInfo: {
    flex: 1,
  },

  apptDoctorName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  apptSpec: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  apptDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },

  apptDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  apptDetailText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },

  stepCircleDone: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },

  stepNum: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[400],
  },

  stepLabel: {
    fontSize: 9,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },

  stepLabelDone: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  stepLine: {
    position: 'absolute',
    top: 14,
    left: '55%',
    right: '-45%',
    height: 2,
    backgroundColor: Colors.neutral[200],
  },

  stepLineDone: {
    backgroundColor: Colors.primary[500],
  },

  apptActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  viewBtn: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
  },

  viewBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
  },

  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },

  joinBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#fff',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  quickItem: {
    width: '23%',
    alignItems: 'center',
  },

  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },

  quickLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[700],
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },

  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },

  medIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  medInfo: {
    flex: 1,
  },

  medName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  medDose: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  medTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  medTimeText: {
    fontSize: FontSize.xs,
    color: Colors.warning[600],
    fontWeight: FontWeight.semibold,
  },

  labItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },

  labIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  labInfo: {
    flex: 1,
  },

  labName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  labDate: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  recentList: {
    gap: Spacing.sm,
  },

  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  recentInfo: {
    flex: 1,
  },

  recentTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  recentDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  ipdCard: {
    marginBottom: Spacing.md,
  },

  ipdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  ipdTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  ipdIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  ipdTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  ipdInfoBox: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },

  billAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning[50],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning[200],
  },

  billAlertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  billAlertInfo: {
    flex: 1,
  },

  billAlertTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.warning[800],
  },

  billAlertDesc: {
    fontSize: FontSize.sm,
    color: Colors.warning[700],
    marginTop: 2,
  },

  emergencyFab: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.error[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
});
