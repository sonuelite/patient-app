import React from 'react';
import {ScrollView, StyleSheet, Text, View, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import BackHeader from '../../../../components/backHeader/BackHeader';
import {Activity, Droplet, Heart, Ruler, Scale, Thermometer, Wind} from 'lucide-react-native';
import {StatTile} from '../../../../components/ui/Widgets';
import {Colors, FontSize, FontWeight, Spacing} from '../../../../constants/theme';
import {useApp} from '../../../../context/AppContext';
import type {RootStackParamList} from '../../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'VitalsScreen'>;
type Reading = string | number | null | undefined;
const formatReading = (value: Reading) =>
  value == null || value === '' || (typeof value === 'number' && !Number.isFinite(value))
    ? '--' : String(value);

const tileAppearance: {icon: typeof Heart; color: React.ComponentProps<typeof StatTile>['color']}[] = [
  {icon: Heart, color: 'error'},
  {icon: Heart, color: 'error'},
  {icon: Activity, color: 'primary'},
  {icon: Heart, color: 'error'},
  {icon: Wind, color: 'teal'},
  {icon: Wind, color: 'teal'},
  {icon: Wind, color: 'teal'},
  {icon: Thermometer, color: 'warning'},
  {icon: Scale, color: 'success'},
  {icon: Ruler, color: 'primary'},
  {icon: Activity, color: 'primary'},
  {icon: Droplet, color: 'accent'},
];

export default function VitalsScreen({route}: Props) {
  const insets = useSafeAreaInsets();
  const {width, fontScale} = useWindowDimensions();
  const {patients} = useApp();
  const vital = patients.find(item => item.id === route.params.patientId)?.vitals[0];
  const bp = vital?.bp?.split('/');
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : width >= 360 ? 2 : 1;
  const cardWidth = (width - Spacing.base * 2 - Spacing.md * (columns - 1)) / columns;
  const readings: {label: string; value: Reading; unit?: string; badge?: string | null}[] = [
    {label: 'Systolic BP', value: vital?.systolicBp ?? bp?.[0]?.trim(), unit: 'mmHg'},
    {label: 'Diastolic BP', value: vital?.diastolicBp ?? bp?.[1]?.trim(), unit: 'mmHg'},
    {label: 'Computed MAP', value: vital?.map, unit: 'mmHg'},
    {label: 'Pulse / Heart Rate', value: vital?.pulse, unit: 'bpm'},
    {label: 'Resp Rate (RR)', value: vital?.respiratoryRate, unit: '/min'},
    {label: 'SpO2 Saturation', value: vital?.spo2, unit: '%'},
    {label: 'O2 Therapy Delivery', value: vital?.oxygenTherapy},
    {label: 'Body Temperature', value: vital?.temperature, unit: vital?.temperatureUnit ?? '°C'},
    {label: 'Weight', value: vital?.weight, unit: 'kg'},
    {label: 'Height', value: vital?.height, unit: 'cm'},
    {label: 'Computed BMI & Class', value: vital?.bmi, unit: 'kg/m²', badge: vital?.bmiClass},
    {label: 'Blood Sugar', value: vital?.bloodSugar},
  ];
  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <BackHeader title="Vitals" />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + Spacing.xl}]}>
        <Text style={styles.title}>Latest vitals</Text>
        <Text style={styles.subtitle}>Your most recent recorded measurements</Text>
        {vital?.date ? <Text style={styles.recorded}>Recorded: {vital.date}</Text> : null}
        {!vital && <Text style={styles.subtitle}>No vitals recorded for this patient yet.</Text>}
        <View style={styles.grid}>
          {readings.map((reading, index) => {
            const {icon: Icon, color} = tileAppearance[index];
            const value = formatReading(reading.value);
            return (
              <View key={reading.label} style={{width: cardWidth}}>
                <StatTile
                  label={reading.label}
                  value={value !== '--' && reading.unit ? `${value} ${reading.unit}` : value}
                  icon={<Icon size={18} color={Colors[color][600]} />}
                  color={color}
                  size="sm"
                  style={[styles.card, {height: 150 * Math.max(1, fontScale)}]}
                  subtitle={reading.badge || undefined}
                />
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
  content: {padding: Spacing.base},
  title: {fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.neutral[900]},
  subtitle: {fontSize: FontSize.sm, color: Colors.neutral[500], marginTop: Spacing.xs, marginBottom: Spacing.md},
  recorded: {fontSize: FontSize.sm, color: Colors.primary[700], marginBottom: Spacing.base},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
  card: {width: '100%'},
});
