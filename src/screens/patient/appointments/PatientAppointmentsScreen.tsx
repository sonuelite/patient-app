// import React, { useState } from 'react';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';

import { EmptyState } from '../../../components/ui/Card';
import { AppointmentCard } from '../../../components/ui/DataDisplay';

import { CalendarX } from 'lucide-react-native';

import { useApp } from '../../../context/AppContext';
import axios from 'axios';
import { getMyAppointments } from '../../../network/api';


type Appointment = React.ComponentProps<typeof AppointmentCard>['appointment'];

export default function PatientAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // const {
  //   currentPatientId,
  //   appointments,
  // } = useApp();

  // const [tab, setTab] = useState<
  //   'upcoming' | 'completed' | 'cancelled'
  // >('upcoming');

  // const myAppointments = appointments.filter(
  //   appointment => appointment.patientId === currentPatientId,
  // );

  // const filtered = myAppointments.filter(appointment => {
  //   if (tab === 'upcoming') {
  //     return [
  //       'confirmed',
  //       'checked-in',
  //       'in-consultation',
  //       'pending',
  //     ].includes(appointment.status);
  //   }

  //   if (tab === 'completed') {
  //     return appointment.status === 'completed';
  //   }

  //   return appointment.status === 'cancelled';
  // });

  const tabs: Array<'upcoming' | 'completed' | 'cancelled'> = [
    'upcoming',
    'completed',
    'cancelled',
  ];

  const { currentPatientId: patientId } = useApp();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [tab, setTab] = useState<'upcoming' | 'completed' | 'cancelled'>(
    'upcoming',
  );

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let active = true;

      setAppointments([]);
      setError(null);

      if (!patientId) {
        setLoading(false);
        setError('Patient information is unavailable');
        return;
      }

      const loadAppointments = async () => {
        setLoading(true);

        try {
          const data = await getMyAppointments(patientId, controller.signal);
          console.log('Requested patient ID:', patientId);
          console.log('Appointments response:', JSON.stringify(data, null, 2));
          console.log(
            'Appointment statuses:',
            data.map(item => item.status),
          );
          // if (active) {
          //   setAppointments(data);
          // }
            if (active) {
            const mappedAppointments = data.map(item => ({
              ...item,
              id: item.appointment_id,
              patientId: item.patient_id,
              doctorName: item.doctor_name,
              department: item.department_name,
              date: item.appointmentDate,
              time: item.appointmentTime?.slice(0, 5) || '—',
              appointmentType: item.appointmentType,
              status: String(item.status ?? '').trim().toLowerCase(),
            }));

            setAppointments(mappedAppointments);
          }
        } catch (err: unknown) {
          if (!active || axios.isCancel(err)) {
            return;
          }

          const message = axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
            : err instanceof Error
            ? err.message
            : 'Unable to load appointments';

          setError(message);
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadAppointments();

      return () => {
        active = false;
        controller.abort();
      };
    }, [patientId, retryCount]),
  );

  // const filtered = appointments.filter(appointment => {
  //   if (tab === 'upcoming') {
  //     return ['confirmed', 'checked-in', 'in-consultation', 'pending'].includes(
  //       appointment.status,
  //     );
  //   }

  //   if (tab === 'completed') {
  //     return appointment.status === 'completed';
  //   }

  //   return appointment.status === 'cancelled';
  // });

//   const filtered = appointments.filter(appointment => {
//   const status = String(appointment.status ?? '')
//     .trim()
//     .toLowerCase();

//   if (tab === 'upcoming') {
//     return [
//       'active',
//       'confirmed',
//       'checked-in',
//       'in-consultation',
//       'pending',
//     ].includes(status);
//   }

//   if (tab === 'completed') {
//     return status === 'completed';
//   }

//   return status === 'cancelled' || status === 'canceled';
// });

const filtered = appointments.filter(appointment => {
  if (tab === 'upcoming') {
    return [
      'active',
      'confirmed',
      'checked-in',
      'in-consultation',
      'pending',
    ].includes(appointment.status);
  }

  if (tab === 'completed') {
    return appointment.status === 'completed';
  }

  return ['cancelled', 'canceled'].includes(appointment.status);
});

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
        <Text style={styles.title}>My Appointments</Text>

        <View style={styles.tabs}>
          {tabs.map(tabItem => (
            <TouchableOpacity
              key={tabItem}
              onPress={() => setTab(tabItem)}
              style={[styles.tab, tab === tabItem && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === tabItem && styles.tabTextActive,
                ]}
              >
                {tabItem.charAt(0).toUpperCase() + tabItem.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointments */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary[700]} />
            <Text style={{ marginTop: 12, color: Colors.neutral[600] }}>
              Loading appointments...
            </Text>
          </View>
        ) : error ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text
              style={{
                color: Colors.neutral[600],
                textAlign: 'center',
              }}
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => setRetryCount(value => value + 1)}
              style={{ padding: 12, marginTop: 12 }}
            >
              <Text style={{ color: Colors.primary[700] }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarX size={48} color={Colors.neutral[300]} />}
            title={`No ${tab} appointments`}
            message={
              tab === 'upcoming'
                ? "You don't have any upcoming appointments. Book one to get started."
                : `No ${tab} appointments to show.`
            }
            action={
              tab === 'upcoming'
                ? {
                    label: 'Book Appointment',
                    onPress: () => navigation.navigate('FindDoctor'),
                  }
                : undefined
            }
          />
        ) : (
          filtered.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={() =>
                navigation.navigate('AppointmentDetail', {
                  appointmentId: appointment.id,
                })
              }
            />
          ))
        )}
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
    marginBottom: Spacing.md,
  },

  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  tab: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
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

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
});
