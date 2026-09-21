import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

import { EmptyState } from '../../../components/ui/Card';
import { AppointmentCard } from '../../../components/ui/DataDisplay';

import { CalendarX } from 'lucide-react-native';

import { useApp } from '../../../context/AppContext';

export default function PatientAppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentPatientId,
    appointments,
  } = useApp();

  const [tab, setTab] = useState<
    'upcoming' | 'completed' | 'cancelled'
  >('upcoming');

  const myAppointments = appointments.filter(
    appointment => appointment.patientId === currentPatientId,
  );

  const filtered = myAppointments.filter(appointment => {
    if (tab === 'upcoming') {
      return [
        'confirmed',
        'checked-in',
        'in-consultation',
        'pending',
      ].includes(appointment.status);
    }

    if (tab === 'completed') {
      return appointment.status === 'completed';
    }

    return appointment.status === 'cancelled';
  });

  const tabs: Array<'upcoming' | 'completed' | 'cancelled'> = [
    'upcoming',
    'completed',
    'cancelled',
  ];

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
        <Text style={styles.title}>
          My Appointments
        </Text>

        <View style={styles.tabs}>
          {tabs.map(tabItem => (
            <TouchableOpacity
              key={tabItem}
              onPress={() => setTab(tabItem)}
              style={[
                styles.tab,
                tab === tabItem && styles.tabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === tabItem && styles.tabTextActive,
                ]}
              >
                {tabItem.charAt(0).toUpperCase() +
                  tabItem.slice(1)}
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
        {filtered.length === 0 ? (
          <EmptyState
            icon={
              <CalendarX
                size={48}
                color={Colors.neutral[300]}
              />
            }
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
                    onPress: () =>
                      navigation.navigate('FindDoctor'),
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
