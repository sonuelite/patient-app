import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import moment from 'moment';
import ReportDateFilter from '../../../components/reportDateFilter/ReportDateFilter';
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
  StatusBadge,
} from '../../../components/ui/DataDisplay';

import {
  FileText,
  Download,
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
import { getPatientVisitHistory, getPatientLabTests, getPatientRadiologyTests } from '../../../network/api';
import type { PatientConsultationVisit, PatientLabTest, PatientRadiologyTest } from '../../../network/api';
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
  const [labFilter, setLabFilter] = useState<{
    patientId: string; startDate: string; endDate: string;
  } | null>(null);
  const [myRads, setMyRads] = useState<PatientRadiologyTest[]>([]);
  const [radsLoading, setRadsLoading] = useState(false);
  const [radsError, setRadsError] = useState<string | null>(null);
  const [radFilter, setRadFilter] = useState<typeof labFilter>(null);
  const [visits, setVisits] = useState<PatientConsultationVisit[]>([]);
  const [visitsPatientId, setVisitsPatientId] = useState<string | null>(null);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [visitFilter, setVisitFilter] = useState<{patientId: string; startDate: string; endDate: string} | null>(null);
  const [expandedVisit, setExpandedVisit] = useState<number | null>(null);
  const isConsultation = tab === 'Consultations';
  useFocusEffect(useCallback(() => {
    if (tab !== 'Consultations' || !visitFilter || visitFilter.patientId !== currentPatientId) {return;}
    let active = true;
    const controller = new AbortController();
    setVisitsPatientId(currentPatientId);
    setVisits([]); setExpandedVisit(null); setVisitsError(null); setVisitsLoading(true);
    const load = async () => {
      try {
        if (!currentPatientId) {throw new Error('Patient information is unavailable');}
        const data = await getPatientVisitHistory(currentPatientId, visitFilter.startDate, visitFilter.endDate, controller.signal);
        if (active) {setVisits(data);}
      } catch (error) {
        if (active) {setVisitsError(getErrorMessage(error, 'Unable to load consultation reports'));}
      } finally {if (active) {setVisitsLoading(false);}}
    };
    load();
    return () => {active = false; controller.abort();};
  }, [currentPatientId, tab, visitFilter]));
  const activeFilter = isConsultation ? visitFilter : tab === 'Radiology' ? radFilter : labFilter;
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

        {(tab === 'Lab Reports' || tab === 'Radiology' || isConsultation) && (
          <ReportDateFilter
            key={tab}
            range={activeFilter?.patientId === currentPatientId ? activeFilter : null}
            onApply={range => {
              const filter = {patientId: currentPatientId, ...range};
              if (isConsultation) {
                setVisits([]); setVisitsError(null); setVisitsLoading(true); setVisitFilter(filter);
              } else if (tab === 'Radiology') {
                setMyRads([]); setRadsError(null); setRadsLoading(true); setRadFilter(filter);
              } else {
                setMyLabs([]); setLabsError(null); setLabsLoading(true); setLabFilter(filter);
              }
            }}
          />
        )}
        {isConsultation && (!visitFilter || visitFilter.patientId !== currentPatientId ? (
          <EmptyState icon={<Stethoscope size={48} color={Colors.neutral[300]} />} title="Select a date range" message="Choose start and end dates, then tap Apply filters to view consultations." />
        ) : visitsLoading || visitsPatientId !== currentPatientId ? (
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        ) : visitsError ? (
          <View>
            <EmptyState icon={<Stethoscope size={48} color={Colors.neutral[300]} />} title="Unable to load consultations" message={visitsError} />
            <TouchableOpacity style={styles.downloadBtn} accessibilityRole="button" onPress={() => {setVisitsLoading(true); setVisitFilter({...visitFilter});}}><Text style={styles.downloadBtnText}>Retry</Text></TouchableOpacity>
          </View>
        ) : visits.length === 0 ? (
          <EmptyState icon={<Stethoscope size={48} color={Colors.neutral[300]} />} title="No consultations" message="No consultations were found for the selected date range." />
        ) : (
          <>
          <Text style={styles.reportCount}>{visits.length} {visits.length === 1 ? 'report' : 'reports'}</Text>
          {visits.map(visit => (
          <Card key={visit.visit_id} style={styles.recordCard}>
            <TouchableOpacity accessibilityRole="button" accessibilityState={{expanded: expandedVisit === visit.visit_id}} onPress={() => setExpandedVisit(expandedVisit === visit.visit_id ? null : visit.visit_id)}>
              <View style={styles.recordTop}>
                <View style={[styles.recordIcon, {backgroundColor: Colors.primary[50]}]}><Stethoscope size={18} color={Colors.primary[600]} /></View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>{visit.department_name || 'Consultation'}</Text>
                  <Text style={styles.recordDesc}>{visit.doctor_name}</Text>
                  <Text style={styles.recordDesc}>{moment(visit.visit_date).format('DD MMM YYYY')} ? {visit.visit_type}</Text>
                </View>
                <Badge label={visit.consultation_status || 'Unknown'} color={visit.consultation_status === 'COMPLETED' ? 'success' : 'primary'} />
              </View>
              {!!visit.chief_complaints?.primary_diagnosis && <Text style={styles.dischargeText}>{visit.chief_complaints.primary_diagnosis}</Text>}
              <View style={[styles.downloadBtn, styles.labReportDownload]}><Text style={styles.labReportDownloadText}>{expandedVisit === visit.visit_id ? 'Hide report' : 'View consultation report'}</Text></View>
            </TouchableOpacity>
            {expandedVisit === visit.visit_id && (
              <View style={styles.dischargeDetails}>
                <Text style={styles.recordTitle}>Clinical assessment</Text>
                {Object.entries(visit.chief_complaints || {}).map(([key, value]) => typeof value === 'string' && value.trim() ? (
                  <View key={key}><Text style={styles.recordMeds}>{key.replace(/_/g, ' ')}</Text><Text style={styles.dischargeText}>{value}</Text></View>
                ) : null)}
                {Object.entries(visit.chief_complaints?.physical_examination || {}).map(([key, value]) => value ? <Text key={key} style={styles.dischargeText}>{key.replace(/_/g, ' ')}: {value}</Text> : null)}
                <Text style={styles.recordTitle}>Plan of care</Text>
                {(['management_goals', 'dietary_lifestyle_advice', 'follow_up_schedule', 'specialty_referral'] as const).map(key => visit.plan_of_care?.[key] ? (
                  <View key={key}><Text style={styles.recordMeds}>{key.replace(/_/g, ' ')}</Text><Text style={styles.dischargeText}>{visit.plan_of_care[key]}</Text></View>
                ) : null)}
                <Text style={styles.recordTitle}>Medicines</Text>
                {!(visit.prescriptions || []).some(rx => rx.medicines?.length) && <Text style={styles.dischargeText}>No medicines prescribed.</Text>}
                {(visit.prescriptions || []).map(rx => (
                  <View key={rx.prescription_id}>
                    <Text style={styles.recordMeds}>{rx.rx_number}</Text>
                    {(rx.medicines || []).map((medicine, index) => (
                      <View key={index}>
                        <Text style={styles.recordTitle}>{medicine.medicine_name}</Text>
                        <Text style={styles.dischargeText}>{[medicine.dosage, medicine.frequency, medicine.duration, medicine.route].filter(Boolean).join(' ? ')}</Text>
                        {!!medicine.instructions && <Text style={styles.dischargeText}>{medicine.instructions}</Text>}
                      </View>
                    ))}
                    {!!rx.additional_notes && <Text style={styles.dischargeText}>{rx.additional_notes}</Text>}
                  </View>
                ))}
                <Text style={styles.recordTitle}>Diagnostic orders</Text>
                {!visit.diagnostic_orders_and_panic_values?.orders?.length && <Text style={styles.dischargeText}>No diagnostic orders.</Text>}
                {(visit.diagnostic_orders_and_panic_values?.orders || []).map(order => (
                  <View key={order.order_id}><Text style={styles.recordMeds}>{order.order_no}</Text>
                    {(order.tests || []).map((test, index) => <Text key={index} style={styles.dischargeText}>{test.test_name} ? {test.test_type} ? {test.status}</Text>)}
                  </View>
                ))}
              </View>
            )}
          </Card>
        ))}
          </>
        ))}
        {tab === 'Lab Reports' &&
          (!labFilter || labFilter.patientId !== currentPatientId ? (
            <EmptyState
              icon={<FlaskConical size={48} color={Colors.neutral[300]} />}
              title="Select a date range"
              message="Choose start and end dates, then tap Apply filters."
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
            <>
            <Text style={styles.reportCount}>{myLabs.length} {myLabs.length === 1 ? 'report' : 'reports'}</Text>
            <View style={styles.labGrid}>
              {myLabs.map(lab => (
                <Card
                  key={`${lab.type}-${lab.reference_id}-${lab.laboratory_id}`}
                  style={[styles.labCard, styles.compactLabCard]}
                  padding={Spacing.sm}
                >
                  <View style={styles.compactLabHeading}>
                    <FlaskConical size={25} color={Colors.primary[600]} />
                    <View style={styles.recordInfo}>
                      <Text style={styles.compactLabTitle} numberOfLines={1}>{lab.test_name}</Text>
                      <Text style={styles.compactLabDate}>{moment(lab.ordered_at).format('D MMM YYYY')}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.compactPdfButton, !lab.can_download && styles.compactPdfDisabled]}
                    hitSlop={4}
                    onPress={() => handleDownloadLab(lab)}
                    disabled={!lab.can_download || downloadingLab !== null}
                    accessibilityRole="button"
                    accessibilityLabel={lab.can_download ? `Download PDF report for ${lab.test_name}` : `PDF report for ${lab.test_name} is unavailable`}
                    accessibilityState={{disabled: !lab.can_download || downloadingLab !== null}}
                  >
                    {downloadingLab === `${lab.type}-${lab.reference_id}-${lab.laboratory_id}` ? (
                      <ActivityIndicator size="small" color={Colors.neutral[0]} />
                    ) : (
                      <>
                        <Download size={16} color={lab.can_download ? Colors.neutral[0] : Colors.neutral[400]} />
                        {lab.can_download && <Text style={styles.labReportDownloadText}>PDF</Text>}
                      </>
                    )}
                  </TouchableOpacity>
                </Card>
            ))}
            </View>
            </>
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
              message="Choose start and end dates, then tap Apply filters."
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
            <>
            <Text style={styles.reportCount}>{myRads.length} {myRads.length === 1 ? 'report' : 'reports'}</Text>
            <View style={styles.labGrid}>
            {myRads.map(rad => (
              <Card
                key={`${rad.type}-${rad.reference_id}-${rad.radiology_id}`}
                style={[styles.labCard, styles.compactLabCard]}
                padding={Spacing.sm}
              >
                <View style={styles.compactLabHeading}>
                  <ImageIcon size={25} color={Colors.primary[600]} />
                  <View style={styles.recordInfo}>
                    <Text style={styles.compactLabTitle} numberOfLines={1}>{rad.test_name.trim()}</Text>
                    <Text style={styles.compactLabDate}>{moment(rad.ordered_at).format('D MMM YYYY')}</Text>
                  </View>
                </View>
                  <TouchableOpacity
                    style={[styles.compactPdfButton, !canDownloadRadiologyReport(rad) && styles.compactPdfDisabled]}
                    hitSlop={4}
                    onPress={() => handleDownloadRadiology(rad)}
                    disabled={!canDownloadRadiologyReport(rad) || downloadingLab !== null}
                    accessibilityRole="button"
                    accessibilityLabel={canDownloadRadiologyReport(rad) ? `Download PDF report for ${rad.test_name.trim()}` : `PDF report for ${rad.test_name.trim()} is unavailable`}
                    accessibilityState={{disabled: !canDownloadRadiologyReport(rad) || downloadingLab !== null}}
                  >
                    {downloadingLab === `radiology-${rad.type}-${rad.reference_id}-${rad.radiology_id}` ? (
                      <ActivityIndicator size="small" color={Colors.neutral[0]} />
                    ) : (
                      <>
                        <Download size={16} color={canDownloadRadiologyReport(rad) ? Colors.neutral[0] : Colors.neutral[400]} />
                        {canDownloadRadiologyReport(rad) && <Text style={styles.labReportDownloadText}>PDF</Text>}
                      </>
                    )}
                  </TouchableOpacity>
              </Card>
            ))}
            </View>
            </>
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
  compactLabCard: {borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.primary[100]},
  compactLabHeading: {flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm},
  compactLabTitle: {fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.neutral[900]},
  compactLabDate: {fontSize: FontSize.xs, color: Colors.neutral[500], marginTop: Spacing.xs},
  compactPdfButton: {alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs, backgroundColor: Colors.primary[600], borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, minHeight: 32, minWidth: 32, marginTop: Spacing.sm},
  compactPdfDisabled: {backgroundColor: Colors.neutral[50], borderWidth: 1, borderColor: Colors.neutral[200]},
  reportCount: {fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.neutral[900], marginBottom: Spacing.sm},
  labReportHeading: {flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm},
  labReportIcon: {width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary[50], alignItems: 'center', justifyContent: 'center'},
  labReportTitle: {flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.neutral[900]},
  labReportDownload: {backgroundColor: Colors.primary[600]},
  labReportDownloadText: {color: Colors.neutral[0], fontSize: FontSize.sm, fontWeight: FontWeight.medium},
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


  recordCard: {
    marginBottom: Spacing.sm,
  },

  labGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },

  labCard: {
    width: '48%',
    justifyContent: 'space-between',
  },



  labDownloadDisabled: {
    opacity: 0.5,
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
