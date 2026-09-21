import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';

import {
  Card,
  Badge,
  EmptyState,
} from '../../../components/ui/Card';

import {
  TimelineItem,
  StatusBadge,
} from '../../../components/ui/DataDisplay';

import {
  FileText,
  Pill,
  FlaskConical,
  Image as ImageIcon,
  FileCheck,
  Syringe,
  ChevronRight,
  Stethoscope,
  BedDouble,
} from 'lucide-react-native';

import { useApp } from '../../../context/AppContext';

const TABS = [
  'Consultations',
  'Prescriptions',
  'Lab Reports',
  'Radiology',
  'Discharge',
  'Documents',
  'Vaccination',
] as const;

const VACCINATION_RECORDS = [
  {
    id: 'V1',
    name: 'COVID-19 (Dose 1)',
    date: '2024-01-15',
    administeredBy: 'Dr. Rajesh Kumar',
    nextDue: 'Booster due 2025-01',
  },
  {
    id: 'V2',
    name: 'Influenza Vaccine',
    date: '2024-10-20',
    administeredBy: 'Dr. Priya Sharma',
    nextDue: 'Annual - due Oct 2025',
  },
  {
    id: 'V3',
    name: 'Tetanus Booster',
    date: '2023-06-10',
    administeredBy: 'Dr. Rajesh Kumar',
    nextDue: 'Due 2033',
  },
];

export default function PatientRecordsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentPatientId,
    appointments,
    prescriptions,
    labOrders,
    radiologyOrders,
    documents,
    patients,
    showToast,
  } = useApp();

  const [tab, setTab] =
    useState<(typeof TABS)[number]>('Consultations');

  const patient = patients.find(
    p => p.id === currentPatientId,
  );

  const completedAppts = appointments.filter(
    a =>
      a.patientId === currentPatientId &&
      a.status === 'completed',
  );

  const myRx = prescriptions.filter(
    p => p.patientId === currentPatientId,
  );

  const myLabs = labOrders.filter(
    l => l.patientId === currentPatientId,
  );

  const myRads = radiologyOrders.filter(
    r => r.patientId === currentPatientId,
  );

  const myDocs = documents.filter(
    d => d.patientId === currentPatientId,
  );

  const dischargeRecords = patient?.ipdAdmission
    ? [
        {
          id: 'DC1',
          admissionDate: patient.ipdAdmission.admissionDate,
          dischargeDate: '2024-08-15',
          diagnosis: patient.ipdAdmission.diagnosis,
          doctor: patient.ipdAdmission.doctorName,
          ward: patient.ipdAdmission.ward,
        },
      ]
    : [];

  const openAppointment = (id: string) => {
    navigation.navigate('AppointmentDetail', {
      id,
    });
  };

  const openPrescription = (id: string) => {
    navigation.navigate('Prescription', {
      id,
    });
  };

  const uploadDocument = () => {
    navigation.navigate('UploadDocument');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
          },
        ]}
      >
        <Text style={styles.title}>Health Records</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.base,
          paddingBottom: Spacing.md,
        }}
      >
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tab,
              tab === t && styles.tabActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                tab === t && styles.tabTextActive,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Spacing.base,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Consultations */}
        {tab === 'Consultations' &&
          (completedAppts.length > 0 ? (
            <View style={styles.timeline}>
              {completedAppts.map((apt, i) => (
                <TouchableOpacity
                  key={apt.id}
                  onPress={() => openAppointment(apt.id)}
                  activeOpacity={0.7}
                >
                  <TimelineItem
                    date={apt.date}
                    title={`${apt.department} Consultation`}
                    subtitle={`${apt.doctorName} · ${apt.consultationType.toUpperCase()}`}
                    isLast={
                      i === completedAppts.length - 1
                    }
                    icon={
                      <Stethoscope
                        size={14}
                        color={Colors.primary[600]}
                      />
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon={
                <Stethoscope
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No consultations"
              message="Your consultation history will appear here."
            />
          ))}

        {/* Prescriptions */}
        {tab === 'Prescriptions' &&
          (myRx.length > 0 ? (
            myRx.map(rx => (
              <Card
                key={rx.id}
                style={styles.recordCard}
                onPress={() => openPrescription(rx.id)}
              >
                <View style={styles.recordTop}>
                  <View
                    style={[
                      styles.recordIcon,
                      {
                        backgroundColor:
                          Colors.primary[50],
                      },
                    ]}
                  >
                    <Pill
                      size={18}
                      color={Colors.primary[600]}
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>
                      {rx.diagnosis}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {rx.doctorName} · {rx.date}
                    </Text>
                  </View>

                  <StatusBadge status={rx.status} />
                </View>

                <Text style={styles.recordMeds}>
                  {rx.medicines.length} medicine(s) prescribed
                </Text>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={
                <Pill
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No prescriptions"
              message="Your prescription history will appear here."
            />
          ))}

        {/* Lab Reports */}
        {tab === 'Lab Reports' &&
          (myLabs.length > 0 ? (
            myLabs.map(lab => (
              <Card
                key={lab.id}
                style={styles.recordCard}
                onPress={() =>
                  showToast(
                    'Lab report opened',
                    'info',
                  )
                }
              >
                <View style={styles.recordTop}>
                  <View
                    style={[
                      styles.recordIcon,
                      {
                        backgroundColor:
                          Colors.warning[50],
                      },
                    ]}
                  >
                    <FlaskConical
                      size={18}
                      color={Colors.warning[600]}
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>
                      {lab.test}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {lab.doctorName} · {lab.date}
                    </Text>
                  </View>

                  <StatusBadge status={lab.status} />
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={
                <FlaskConical
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No lab reports"
              message="Your lab reports will appear here."
            />
          ))}

        {/* Radiology */}
        {tab === 'Radiology' &&
          (myRads.length > 0 ? (
            myRads.map(rad => (
              <Card
                key={rad.id}
                style={styles.recordCard}
                onPress={() =>
                  showToast(
                    'Radiology report opened',
                    'info',
                  )
                }
              >
                <View style={styles.recordTop}>
                  <View
                    style={[
                      styles.recordIcon,
                      {
                        backgroundColor:
                          Colors.accent[50],
                      },
                    ]}
                  >
                    <ImageIcon
                      size={18}
                      color={Colors.accent[600]}
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>
                      {rad.type} -{' '}
                      {rad.indication || 'Imaging'}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {rad.doctorName} · {rad.date}
                    </Text>
                  </View>

                  <StatusBadge status={rad.status} />
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={
                <ImageIcon
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No radiology"
              message="Your radiology reports will appear here."
            />
          ))}

        {/* Discharge */}
        {tab === 'Discharge' &&
          (dischargeRecords.length > 0 ? (
            dischargeRecords.map(dc => (
              <Card
                key={dc.id}
                style={styles.recordCard}
              >
                <View style={styles.recordTop}>
                  <View
                    style={[
                      styles.recordIcon,
                      {
                        backgroundColor:
                          Colors.error[50],
                      },
                    ]}
                  >
                    <BedDouble
                      size={18}
                      color={Colors.error[600]}
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>
                      Discharge Summary
                    </Text>

                    <Text style={styles.recordDesc}>
                      {dc.diagnosis} · {dc.ward}
                    </Text>
                  </View>

                  <Badge
                    label="Discharged"
                    color="success"
                  />
                </View>

                <View style={styles.dischargeDetails}>
                  <Text style={styles.dischargeText}>
                    Admitted: {dc.admissionDate}
                  </Text>

                  <Text style={styles.dischargeText}>
                    Discharged: {dc.dischargeDate}
                  </Text>

                  <Text style={styles.dischargeText}>
                    Attending: {dc.doctor}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.downloadBtn}
                  onPress={() =>
                    showToast(
                      'Downloading discharge summary...',
                      'info',
                    )
                  }
                  activeOpacity={0.7}
                >
                  <FileCheck
                    size={16}
                    color={Colors.primary[600]}
                  />

                  <Text
                    style={styles.downloadBtnText}
                  >
                    Download Summary
                  </Text>
                </TouchableOpacity>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={
                <FileCheck
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No discharge records"
              message="Discharge summaries will appear here after an IPD stay."
            />
          ))}

        {/* Documents */}
        {tab === 'Documents' && (
          <>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={uploadDocument}
              activeOpacity={0.7}
            >
              <Text style={styles.uploadBtnText}>
                + Upload Document
              </Text>
            </TouchableOpacity>

            {myDocs.length > 0 ? (
              myDocs.map(doc => (
                <Card
                  key={doc.id}
                  style={styles.recordCard}
                  onPress={() =>
                    showToast(
                      'Document opened',
                      'info',
                    )
                  }
                >
                  <View style={styles.recordTop}>
                    <View
                      style={[
                        styles.recordIcon,
                        {
                          backgroundColor:
                            Colors.neutral[100],
                        },
                      ]}
                    >
                      <FileText
                        size={18}
                        color={Colors.neutral[600]}
                      />
                    </View>

                    <View style={styles.recordInfo}>
                      <Text style={styles.recordTitle}>
                        {doc.name}
                      </Text>

                      <Text style={styles.recordDesc}>
                        {doc.category} · {doc.size}
                      </Text>
                    </View>

                    <ChevronRight
                      size={18}
                      color={Colors.neutral[300]}
                    />
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={
                  <FileText
                    size={48}
                    color={Colors.neutral[300]}
                  />
                }
                title="No documents"
                message="Upload medical documents for easy access."
              />
            )}
          </>
        )}

        {/* Vaccination */}
        {tab === 'Vaccination' &&
          (VACCINATION_RECORDS.length > 0 ? (
            VACCINATION_RECORDS.map(vac => (
              <Card
                key={vac.id}
                style={styles.recordCard}
              >
                <View style={styles.recordTop}>
                  <View
                    style={[
                      styles.recordIcon,
                      {
                        backgroundColor:
                          Colors.success[50],
                      },
                    ]}
                  >
                    <Syringe
                      size={18}
                      color={Colors.success[600]}
                    />
                  </View>

                  <View style={styles.recordInfo}>
                    <Text style={styles.recordTitle}>
                      {vac.name}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {vac.date} · {vac.administeredBy}
                    </Text>
                  </View>
                </View>

                <View style={styles.vacNextDue}>
                  <Text
                    style={styles.vacNextDueText}
                  >
                    Next: {vac.nextDue}
                  </Text>
                </View>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={
                <Syringe
                  size={48}
                  color={Colors.neutral[300]}
                />
              }
              title="No vaccination records"
              message="Your vaccination history will appear here."
            />
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  header: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.neutral[50],
    marginRight: Spacing.sm,
  },

  tabActive: {
    backgroundColor: Colors.primary[50],
  },

  tabText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.medium,
  },

  tabTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  timeline: {
    paddingTop: Spacing.sm,
  },

  recordCard: {
    marginBottom: Spacing.sm,
  },

  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  recordInfo: {
    flex: 1,
  },

  recordTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  recordDesc: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  recordMeds: {
    fontSize: FontSize.xs,
    color: Colors.neutral[500],
    marginTop: Spacing.sm,
  },

  uploadBtn: {
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary[200],
    borderStyle: 'dashed',
  },

  uploadBtnText: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },

  dischargeDetails: {
    backgroundColor: Colors.neutral[50],
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },

  dischargeText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
  },

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
  },

  downloadBtnText: {
    fontSize: FontSize.sm,
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  vacNextDue: {
    marginTop: Spacing.md,
    backgroundColor: Colors.success[50],
    borderRadius: Radius.sm,
    padding: Spacing.sm,
  },

  vacNextDueText: {
    fontSize: FontSize.xs,
    color: Colors.success[700],
    fontWeight: FontWeight.semibold,
  },
});