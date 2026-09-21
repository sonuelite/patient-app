import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
} from '../../../constants/theme';

import {Card} from '../../../components/ui/Card';
import {Avatar} from '../../../components/ui/DataDisplay';

import {
  Video,
  Phone,
  MessageCircle,
  Siren,
  ChevronRight,
} from 'lucide-react-native';

import {useApp} from '../../../context/AppContext';

type RootStackParamList = {
  FindDoctor: undefined;
  Emergency: undefined;
  Consultation: {
    id: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PatientConsultScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const {
    currentPatientId,
    appointments,
    doctors,
  } = useApp();

  const videoAppts = appointments.filter(
    a =>
      a.patientId === currentPatientId &&
      (a.consultationType === 'video' ||
        a.consultationType === 'online') &&
      a.status === 'confirmed',
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
          },
        ]}>
        <Text style={styles.title}>Consult</Text>

        <Text style={styles.subtitle}>
          Connect with doctors online
        </Text>
      </View>

      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Consultation Options */}
        <View style={styles.optionsGrid}>
          {/* Video Consult */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('FindDoctor')}
            activeOpacity={0.7}>
            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor: Colors.primary[50],
                },
              ]}>
              <Video
                size={24}
                color={Colors.primary[600]}
              />
            </View>

            <Text style={styles.optionTitle}>
              Video Consult
            </Text>

            <Text style={styles.optionDesc}>
              See a doctor via video call
            </Text>
          </TouchableOpacity>

          {/* Audio Call */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('FindDoctor')}
            activeOpacity={0.7}>
            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor: Colors.success[50],
                },
              ]}>
              <Phone
                size={24}
                color={Colors.success[600]}
              />
            </View>

            <Text style={styles.optionTitle}>
              Audio Call
            </Text>

            <Text style={styles.optionDesc}>
              Talk to a doctor on call
            </Text>
          </TouchableOpacity>

          {/* Chat */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('FindDoctor')}
            activeOpacity={0.7}>
            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor: Colors.accent[50],
                },
              ]}>
              <MessageCircle
                size={24}
                color={Colors.accent[600]}
              />
            </View>

            <Text style={styles.optionTitle}>
              Chat
            </Text>

            <Text style={styles.optionDesc}>
              Message a doctor
            </Text>
          </TouchableOpacity>

          {/* Emergency */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('Emergency')}
            activeOpacity={0.7}>
            <View
              style={[
                styles.optionIcon,
                {
                  backgroundColor: Colors.error[50],
                },
              ]}>
              <Siren
                size={24}
                color={Colors.error[600]}
              />
            </View>

            <Text style={styles.optionTitle}>
              Emergency
            </Text>

            <Text style={styles.optionDesc}>
              Get urgent help
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Consultations */}
        {videoAppts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Active Consultations
            </Text>

            {videoAppts.map(apt => {
              const doctor = doctors.find(
                d => d.id === apt.doctorId,
              );

              return (
                <Card
                  key={apt.id}
                  style={styles.activeCard}
                  onPress={() =>
                    navigation.navigate('Consultation', {
                      id: apt.id,
                    })
                  }>
                  <View style={styles.activeRow}>
                    <Avatar
                      uri={doctor?.photo}
                      size={48}
                      name={doctor?.name}
                    />

                    <View style={styles.activeInfo}>
                      <Text style={styles.activeDoctor}>
                        {apt.doctorName}
                      </Text>

                      <Text style={styles.activeDept}>
                        {apt.department} · {apt.date}{' '}
                        {apt.time}
                      </Text>
                    </View>

                    <View style={styles.joinBtn}>
                      <Video
                        size={16}
                        color="#fff"
                      />

                      <Text style={styles.joinBtnText}>
                        Join
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </>
        )}

        {/* Need a Doctor */}
        <Text style={styles.sectionTitle}>
          Need a Doctor?
        </Text>

        <Card
          onPress={() => navigation.navigate('FindDoctor')}
          style={styles.findCard}>
          <View style={styles.findRow}>
            <Text style={styles.findText}>
              Find a Doctor
            </Text>

            <ChevronRight
              size={20}
              color={Colors.primary[600]}
            />
          </View>
        </Card>
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
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  subtitle: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
  },

  contentContainer: {
    padding: Spacing.base,
    paddingBottom: 100,
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  optionCard: {
    width: '48%',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadows.sm,
  },

  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  optionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  optionDesc: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },

  activeCard: {
    marginBottom: Spacing.sm,
  },

  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  activeDoctor: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  activeDept: {
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  joinBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    alignItems: 'center',
  },

  joinBtnText: {
    color: '#fff',
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },

  findCard: {
    marginBottom: Spacing.sm,
  },

  findRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  findText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
  },
});
