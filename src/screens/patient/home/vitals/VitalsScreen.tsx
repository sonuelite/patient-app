import React from 'react';
import {ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Activity, Droplets, Heart, HeartPulse, Ruler, Scale, Thermometer, Wind} from 'lucide-react-native';
import BackHeader from '../../../../components/backHeader/BackHeader';
import {Colors, FontSize, FontWeight, Radius, Spacing} from '../../../../constants/theme';
import {usePatientVitals} from '../../../../hooks/usePatientVitals';
import type {RootStackParamList} from '../../../../types';
import {calculateBMI, type BMICategory} from '../../../../utils/calculateBMI';

type Props = NativeStackScreenProps<RootStackParamList, 'VitalsScreen'>;
type Reading = string | number | null | undefined;
const formatReading = (value: Reading) =>
  value == null || value === '' || (typeof value === 'number' && !Number.isFinite(value))
    ? '--' : String(value);

const bmiBadgeColors: Record<BMICategory, {backgroundColor: string; color: string}> = {
  Underweight: {backgroundColor: Colors.primary[50], color: Colors.primary[700]},
  Normal: {backgroundColor: Colors.success[50], color: Colors.success[700]},
  Overweight: {backgroundColor: Colors.warning[50], color: Colors.warning[700]},
  Obese: {backgroundColor: Colors.error[50], color: Colors.error[700]},
};

export default function VitalsScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {vital, loading, error, retry} = usePatientVitals(route.params.patientId);
  const computedBMI = calculateBMI(vital?.height, vital?.weight);
  const bmiBadge = computedBMI.bmi_category ? bmiBadgeColors[computedBMI.bmi_category] : undefined;
  const readings: {label: string; value: Reading; unit?: string; detail?: string; badge?: string; icon: typeof Heart; color: string}[] = [
    {label: 'Systolic BP', value: vital?.systolic, unit: 'mmHg', icon: HeartPulse, color: Colors.error[500]},
    {label: 'Diastolic BP', value: vital?.diastolic, unit: 'mmHg', icon: HeartPulse, color: Colors.error[500]},
    {label: 'Computed MAP', value: vital?.map, unit: 'mmHg', detail: 'Formula: (2D + S)/3', icon: Activity, color: Colors.primary[600]},
    {label: 'Pulse / Heart Rate', value: vital?.pulse, unit: 'bpm', icon: Heart, color: Colors.error[500]},
    {label: 'Resp Rate (RR)', value: vital?.respiratoryRate, unit: '/min', icon: Wind, color: Colors.teal[500]},
    {label: 'SpO2 Saturation', value: vital?.spo2, unit: '%', icon: Droplets, color: Colors.teal[500]},
    {label: 'O2 Therapy Delivery', value: vital?.o2_therapy, icon: Wind, color: Colors.teal[500]},
    {label: 'Body Temperature', value: vital?.temperature, unit: vital?.temperature_unit ?? '\u00b0C', icon: Thermometer, color: Colors.accent[500]},
    {label: 'Weight', value: vital?.weight, unit: 'kg', icon: Scale, color: Colors.success[600]},
    {label: 'Height', value: vital?.height, unit: 'cm', icon: Ruler, color: Colors.primary[600]},
    {label: 'Computed BMI & Class', value: computedBMI.bmi?.toFixed(1), unit: 'kg/m\u00b2',
      badge: computedBMI.bmi_category || undefined,
      detail: vital && computedBMI.bmi === null ? 'Valid height and weight required' : undefined,
      icon: Activity, color: Colors.primary[600]},
  ];

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <BackHeader title="Patient Vitals" />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + Spacing.xl}]}>
        <View style={styles.card}>
          <View style={styles.listHeader}>
            <Text style={styles.eyebrow}>LATEST RECORDED VITALS</Text>
            {vital?.vitals_updated_at ? (
              <Text style={styles.recorded}>
                Recorded: {new Date(vital.vitals_updated_at).toLocaleString()}
              </Text>
            ) : null}
          </View>
          {loading && <ActivityIndicator style={styles.feedback} color={Colors.primary[600]} />}
          {error && (
            <View style={styles.feedback}>
              <Text style={styles.error}>{error}</Text>
              <TouchableOpacity onPress={retry} accessibilityRole="button" style={styles.retryButton}>
                <Text style={styles.retryText}>Retry vitals</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && !error && !vital && (
            <Text style={styles.empty}>No vitals recorded for this patient yet.</Text>
          )}
          {readings.map(({label, value: reading, unit, detail, badge, icon: Icon, color}, index) => {
            const value = formatReading(reading);
            return (
              <View key={label} style={[styles.row, index < readings.length - 1 && styles.rowDivider]}>
                <View style={styles.icon}><Icon size={20} color={color} strokeWidth={1.8} /></View>
                <View style={styles.reading}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.value}>
                    {value}
                    {value !== '--' && unit ? <Text style={styles.unit}> {unit}</Text> : null}
                  </Text>
                  {badge ? (
                    <View style={[styles.badge, bmiBadge && {backgroundColor: bmiBadge.backgroundColor}]}>
                      <Text style={[styles.badgeText, bmiBadge && {color: bmiBadge.color}]}>{badge}</Text>
                    </View>
                  ) : null}
                  {detail ? <Text style={styles.detail}>{detail}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.neutral[50]},
  content: {padding: Spacing.base, width: '100%', maxWidth: 760, alignSelf: 'center'},
  card: {backgroundColor: Colors.neutral[0], borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.neutral[200], paddingHorizontal: Spacing.base},
  listHeader: {paddingTop: Spacing.base, paddingBottom: Spacing.sm},
  eyebrow: {fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.neutral[500]},
  recorded: {fontSize: FontSize.xs, color: Colors.neutral[500], marginTop: Spacing.sm},
  row: {flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.base},
  rowDivider: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.neutral[200]},
  icon: {width: 28, alignItems: 'center', marginRight: Spacing.md},
  reading: {flex: 1, minWidth: 0},
  label: {fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.neutral[700]},
  value: {fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.neutral[900], marginTop: Spacing.xs},
  unit: {fontSize: FontSize.xs, fontWeight: FontWeight.regular, color: Colors.neutral[500]},
  detail: {fontSize: FontSize.xs, color: Colors.neutral[500], marginTop: Spacing.xs},
  badge: {alignSelf: 'flex-start', backgroundColor: Colors.neutral[100], borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, marginTop: Spacing.sm, maxWidth: '100%'},
  badgeText: {fontSize: FontSize.xs, color: Colors.neutral[700], fontWeight: FontWeight.medium},
  feedback: {paddingVertical: Spacing.base},
  error: {color: Colors.error[600], fontSize: FontSize.sm},
  retryButton: {alignSelf: 'flex-start', paddingVertical: Spacing.md},
  retryText: {color: Colors.primary[600], fontWeight: FontWeight.semibold},
  empty: {fontSize: FontSize.sm, color: Colors.neutral[500], paddingVertical: Spacing.base},
});
