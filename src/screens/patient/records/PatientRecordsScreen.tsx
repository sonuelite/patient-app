import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import moment from 'moment';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

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
import { getPatientLabTests, getPatientRadiologyTests } from '../../../network/api';
import type { PatientLabTest, PatientRadiologyTest } from '../../../network/api';
import { getErrorMessage } from '../../../utils/apiError';
import { canDownloadRadiologyReport, downloadLabReport, downloadRadiologyReport } from '../../../utils/downloadLabReport';

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
    documents,
    patients,
    showToast,
  } = useApp();

  const [tab, setTab] =
    useState<(typeof TABS)[number]>('Consultations');
  const [myLabs, setMyLabs] = useState<PatientLabTest[]>([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [labsError, setLabsError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterError, setFilterError] = useState<string | null>(null);
  const [labFilter, setLabFilter] = useState<{
    patientId: string; startDate: string; endDate: string;
  } | null>(null);
  const [myRads, setMyRads] = useState<PatientRadiologyTest[]>([]);
  const [radsLoading, setRadsLoading] = useState(false);
  const [radsError, setRadsError] = useState<string | null>(null);
  const [radStartDate, setRadStartDate] = useState('');
  const [radEndDate, setRadEndDate] = useState('');
  const [radFilterError, setRadFilterError] = useState<string | null>(null);
  const [radFilter, setRadFilter] = useState<typeof labFilter>(null);
  const isRadiology = tab === 'Radiology';
  const activeStartDate = isRadiology ? radStartDate : startDate;
  const activeEndDate = isRadiology ? radEndDate : endDate;
  const activeFilterError = isRadiology ? radFilterError : filterError;
  const activeFilter = isRadiology ? radFilter : labFilter;
  const setActiveStartDate = isRadiology ? setRadStartDate : setStartDate;
  const setActiveEndDate = isRadiology ? setRadEndDate : setEndDate;
  const setActiveFilterError = isRadiology ? setRadFilterError : setFilterError;

  const applyDateFilter = () => {
    const start = moment(activeStartDate, 'YYYY-MM-DD', true);
    const end = moment(activeEndDate, 'YYYY-MM-DD', true);
    if (!start.isValid() || !end.isValid()) {
      setActiveFilterError('Enter both dates in YYYY-MM-DD format.');
      return;
    }
    if (start.isAfter(end, 'day')) {
      setActiveFilterError('Start date must be on or before end date.');
      return;
    }
    setActiveFilterError(null);
    if (isRadiology) {
      setMyRads([]);
      setRadsError(null);
      setRadsLoading(true);
      setRadFilter({patientId: currentPatientId, startDate: radStartDate, endDate: radEndDate});
      return;
    }
    setMyLabs([]);
    setLabsError(null);
    setLabsLoading(true);
    setLabFilter({patientId: currentPatientId, startDate, endDate});
  };
  const [downloadingLab, setDownloadingLab] = useState<string | null>(null);
  const downloadInProgress = useRef(false);
  const [report, setReport] = useState<{path: string; title: string; patientId: string} | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState('');
  const activePatientId = useRef(currentPatientId);
  activePatientId.current = currentPatientId;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    return () => {
      if (report) {
        ReactNativeBlobUtil.fs.unlink(report.path).catch(() => undefined);
      }
    };
  }, [report]);

  useEffect(() => {
    setReport(null);
  }, [currentPatientId]);

  const closeReport = () => setReport(null);

  const handleDownloadRadiology = async (rad: PatientRadiologyTest) => {
    if (downloadInProgress.current || !canDownloadRadiologyReport(rad)) {
      return;
    }
    downloadInProgress.current = true;
    setDownloadingLab(`radiology-${rad.type}-${rad.reference_id}-${rad.radiology_id}`);
    try {
      const result = await downloadRadiologyReport(rad);
      if (!mounted.current || activePatientId.current !== currentPatientId) {
        await ReactNativeBlobUtil.fs.unlink(result.path).catch(() => undefined);
        return;
      }
      setViewerError(null);
      setPageInfo('');
      setReport({path: result.path, title: rad.test_name.trim(), patientId: currentPatientId});
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to download radiology report'), 'error');
    } finally {
      downloadInProgress.current = false;
      if (mounted.current) {setDownloadingLab(null);}
    }
  };

  const handleDownloadLab = async (lab: PatientLabTest) => {
    if (downloadInProgress.current) {
      return;
    }
    downloadInProgress.current = true;
    setDownloadingLab(`${lab.type}-${lab.reference_id}-${lab.laboratory_id}`);
    try {
      const result = await downloadLabReport(lab);
      if (!mounted.current || activePatientId.current !== currentPatientId) {
        await ReactNativeBlobUtil.fs.unlink(result.path).catch(() => undefined);
        return;
      }
      setViewerError(null);
      setPageInfo('');
      setReport({path: result.path, title: lab.test_name, patientId: currentPatientId});
    } catch (error) {
      showToast(getErrorMessage(error, 'Unable to download lab report'), 'error');
    } finally {
      downloadInProgress.current = false;
      setDownloadingLab(null);
    }
  };

  useFocusEffect(useCallback(() => {
    if (tab !== 'Lab Reports') {
      return;
    }
    if (!labFilter || labFilter.patientId !== currentPatientId) {
      setMyLabs([]);
      setLabsError(null);
      setLabsLoading(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setMyLabs([]);
    setLabsError(null);
    setLabsLoading(true);

    const loadLabs = async () => {
      try {
        if (!currentPatientId) {
          throw new Error('Patient information is unavailable');
        }
        const data = await getPatientLabTests(
          currentPatientId, labFilter.startDate, labFilter.endDate, controller.signal,
        );
        if (active) {
          setMyLabs(data);
        }
      } catch (error) {
        if (active) {
          setLabsError(getErrorMessage(error, 'Unable to load lab reports'));
        }
      } finally {
        if (active) {
          setLabsLoading(false);
        }
      }
    };
    loadLabs();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currentPatientId, tab, labFilter]));

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

  useFocusEffect(useCallback(() => {
    if (tab !== 'Radiology') {
      return;
    }
    setMyRads([]);
    setRadsError(null);
    if (!radFilter || radFilter.patientId !== currentPatientId) {
      setRadsLoading(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setRadsLoading(true);
    const loadRadiology = async () => {
      try {
        if (!currentPatientId) {
          throw new Error('Patient information is unavailable');
        }
        const data = await getPatientRadiologyTests(
          currentPatientId, radFilter.startDate, radFilter.endDate, controller.signal,
        );
        if (active) {setMyRads(data);}
      } catch (error) {
        if (active) {setRadsError(getErrorMessage(error, 'Unable to load radiology reports'));}
      } finally {
        if (active) {setRadsLoading(false);}
      }
    };
    loadRadiology();
    return () => {active = false; controller.abort();};
  }, [currentPatientId, tab, radFilter]));

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
      style={{ flexGrow: 0 }}
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
        {(tab === 'Lab Reports' || tab === 'Radiology') && (
          <Card style={styles.recordCard}>
            <Text style={styles.recordTitle}>Filter by date</Text>
            <Text style={styles.recordDesc}>Enter dates as YYYY-MM-DD</Text>
            <View style={styles.dateFilterRow}>
              <View style={styles.recordInfo}>
                <Text style={styles.recordMeds}>Start date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={activeStartDate}
                  onChangeText={value => {setActiveStartDate(value); setActiveFilterError(null);}}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.neutral[400]}
                  accessibilityLabel={`${tab} start date`}
                  maxLength={10}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordMeds}>End date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={activeEndDate}
                  onChangeText={value => {setActiveEndDate(value); setActiveFilterError(null);}}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.neutral[400]}
                  accessibilityLabel={`${tab} end date`}
                  maxLength={10}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            {!!activeFilterError && <Text style={styles.filterError}>{activeFilterError}</Text>}
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={applyDateFilter}
              accessibilityRole="button"
            >
              <Text style={styles.downloadBtnText}>Show Reports</Text>
            </TouchableOpacity>
            {activeFilter?.patientId === currentPatientId && (
              <Text style={styles.recordMeds}>
                Showing: {activeFilter.startDate} to {activeFilter.endDate}
              </Text>
            )}
          </Card>
        )}
        {tab === 'Lab Reports' &&
          (!labFilter || labFilter.patientId !== currentPatientId ? (
            <EmptyState
              icon={<FlaskConical size={48} color={Colors.neutral[300]} />}
              title="Select a date range"
              message="Choose start and end dates, then tap Show Reports."
            />
          ) : labsLoading ? (
            <ActivityIndicator size="large" color={Colors.primary[600]} />
          ) : labsError ? (
            <View>
              <EmptyState
                icon={<FlaskConical size={48} color={Colors.neutral[300]} />}
                title="Unable to load lab reports"
                message={labsError}
              />
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => {setLabsLoading(true); setLabFilter({...labFilter});}}
                accessibilityRole="button"
              >
                <Text style={styles.downloadBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : myLabs.length > 0 ? (
            myLabs.map(lab => (
              <Card
                key={`${lab.type}-${lab.reference_id}-${lab.laboratory_id}`}
                style={styles.recordCard}
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
                      {lab.test_name}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {lab.sample_type} · {new Date(lab.ordered_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <StatusBadge status={lab.test_status.toLowerCase()} />
                </View>
                <Text style={styles.recordMeds}>
                  Priority: {lab.priority} · Source: {lab.source_label}
                </Text>
                <Text style={styles.recordMeds}>
                  Sample: {lab.sample_status}
                  {lab.approval_status ? ` · Approval: ${lab.approval_status}` : ''}
                </Text>
                <Text style={styles.recordMeds}>
                  {lab.can_download && lab.download_url
                    ? 'Report available'
                    : 'Report not ready'}
                </Text>
                {lab.can_download && (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadLab(lab)}
                    disabled={downloadingLab !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`Download report for ${lab.test_name}`}
                    accessibilityState={{disabled: downloadingLab !== null}}
                  >
                    {downloadingLab === `${lab.type}-${lab.reference_id}-${lab.laboratory_id}` ? (
                      <>
                        <ActivityIndicator size="small" color={Colors.primary[600]} />
                        <Text style={styles.downloadBtnText}>Downloading...</Text>
                      </>
                    ) : (
                      <>
                        <FileCheck size={16} color={Colors.primary[600]} />
                        <Text style={styles.downloadBtnText}>Download Report</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
              message="No lab reports were found for the selected date range."
            />
          ))}

        {/* Radiology */}
        {tab === 'Radiology' &&
          (!radFilter || radFilter.patientId !== currentPatientId ? (
            <EmptyState
              icon={<ImageIcon size={48} color={Colors.neutral[300]} />}
              title="Select a date range"
              message="Choose start and end dates, then tap Show Reports."
            />
          ) : radsLoading ? (
            <ActivityIndicator size="large" color={Colors.primary[600]} />
          ) : radsError ? (
            <View>
              <EmptyState
                icon={<ImageIcon size={48} color={Colors.neutral[300]} />}
                title="Unable to load radiology reports"
                message={radsError}
              />
              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => {setRadsLoading(true); setRadFilter({...radFilter});}}
                accessibilityRole="button"
              >
                <Text style={styles.downloadBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : myRads.length > 0 ? (
            myRads.map(rad => (
              <Card
                key={`${rad.type}-${rad.reference_id}-${rad.radiology_id}`}
                style={styles.recordCard}
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
                      {rad.test_name.trim()}
                    </Text>

                    <Text style={styles.recordDesc}>
                      {rad.modality} · {new Date(rad.ordered_at).toLocaleDateString()}
                    </Text>
                  </View>

                  <Badge
                    label={rad.test_status === 'PROGRESS' ? 'In progress' : rad.test_status === 'REJECT' ? 'Rejected' : rad.test_status}
                    color={rad.test_status === 'REJECT' ? 'error' : rad.test_status === 'COMPLETED' ? 'success' : 'warning'}
                  />
                </View>
                <Text style={styles.recordMeds}>Priority: {rad.priority} · Source: {rad.source_label}</Text>
                {!!rad.approval_status && <Text style={styles.recordMeds}>Approval: {rad.approval_status}</Text>}
                {!!rad.external_lab_name && <Text style={styles.recordMeds}>External lab: {rad.external_lab_name}</Text>}
                <Text style={styles.recordMeds}>
                  {rad.download_status === 'REJECTED' ? 'Report rejected' : canDownloadRadiologyReport(rad) ? 'Report available' : 'Report not ready'}
                </Text>
                {canDownloadRadiologyReport(rad) && (
                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => handleDownloadRadiology(rad)}
                    disabled={downloadingLab !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`Download and view report for ${rad.test_name.trim()}`}
                    accessibilityState={{disabled: downloadingLab !== null}}
                  >
                    {downloadingLab === `radiology-${rad.type}-${rad.reference_id}-${rad.radiology_id}` ? (
                      <>
                        <ActivityIndicator size="small" color={Colors.primary[600]} />
                        <Text style={styles.downloadBtnText}>Downloading...</Text>
                      </>
                    ) : (
                      <>
                        <FileCheck size={16} color={Colors.primary[600]} />
                        <Text style={styles.downloadBtnText}>Download Report</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
              message="No radiology reports were found for the selected date range."
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
      <Modal
        visible={report !== null && report.patientId === currentPatientId}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeReport}
      >
        <View style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom}]}>
          <View style={styles.viewerHeader}>
            <View style={styles.recordInfo}>
              <Text style={styles.recordTitle} numberOfLines={2}>{report?.title}</Text>
              {!!pageInfo && <Text style={styles.recordDesc}>{pageInfo}</Text>}
            </View>
            <TouchableOpacity onPress={closeReport} accessibilityRole="button" style={styles.closeViewer}>
              <Text style={styles.downloadBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          {viewerError ? (
            <EmptyState
              icon={<FileText size={48} color={Colors.neutral[300]} />}
              title="Unable to display report"
              message={viewerError}
            />
          ) : report && (
            <Pdf
              source={{uri: `file://${report.path}`}}
              style={styles.pdf}
              trustAllCerts={false}
              onLoadComplete={pages => setPageInfo(`Page 1 of ${pages}`)}
              onPageChanged={(page, pages) => setPageInfo(`Page ${page} of ${pages}`)}
              onError={() => setViewerError('The report was downloaded but could not be displayed. Close and try again.')}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dateFilterRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    color: Colors.neutral[900],
    fontSize: FontSize.sm,
  },
  filterError: {
    color: Colors.error[600],
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.neutral[0],
    gap: Spacing.md,
  },
  closeViewer: {
    padding: Spacing.sm,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
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
