import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Phone,
  MapPin,
  Siren,
  Ambulance,
  User,
  Building2,
  Navigation,
} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
} from '../../../constants/theme';
import BackHeader from '../../../components/backHeader/BackHeader';

type EmergencyContact = {
  name: string;
  phone: string;
  relation?: string;
};

type EmergencyScreenProps = {
  hospitalName?: string;
  hospitalPhone?: string;
  hospitalAddress?: string;
  ambulancePhone?: string;
  emergencyContact?: EmergencyContact | null;
};

export default function EmergencyScreen({
  hospitalName,
  hospitalPhone,
  hospitalAddress,
  ambulancePhone,
  emergencyContact,
}: EmergencyScreenProps) {
  const insets = useSafeAreaInsets();

  const openDialer = async (number: string) => {
    const dialNumber = number.replace(/[^\d+]/g, '');

    if (!dialNumber || !/\d/.test(dialNumber)) {
      Alert.alert('Invalid Number', 'A valid phone number is required.');
      return;
    }

    try {
      await Linking.openURL(`tel:${dialNumber}`);
    } catch {
      Alert.alert(
        'Unable to Open Dialer',
        `Please dial ${number} manually.`,
      );
    }
  };

  const handleCall = (number: string | undefined, label: string) => {
    if (!number?.trim()) {
      Alert.alert(
        'Contact Unavailable',
        `${label} phone number has not been provided.`,
      );
      return;
    }

    Alert.alert(
      `Call ${label}`,
      `Open the dialer for ${number}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Open Dialer',
          onPress: () => {
            void openDialer(number);
          },
        },
      ],
    );
  };

  const handleEmergency = () => {
    handleCall(ambulancePhone, 'Ambulance');
  };

  const handleDirections = async () => {
    if (!hospitalAddress?.trim()) {
      Alert.alert(
        'Location Unavailable',
        'The hospital address has not been provided.',
      );
      return;
    }

    const destination = encodeURIComponent(hospitalAddress);
    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Unable to Open Maps',
        'Please search for the hospital address in your maps app.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <BackHeader title="Emergency" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + Spacing.xxl},
        ]}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleEmergency}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open ambulance phone dialer">
          <Siren size={48} color="#FFFFFF" />

          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSub}>Call Ambulance</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Emergency Contacts</Text>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => handleCall(ambulancePhone, 'Ambulance')}
          accessibilityRole="button">
          <View style={[styles.contactIcon, styles.ambulanceIcon]}>
            <Ambulance size={24} color={Colors.error[600]} />
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Ambulance</Text>
            <Text style={styles.contactNumber}>
              {ambulancePhone || 'Contact unavailable'}
            </Text>
          </View>

          <Phone size={20} color={Colors.error[600]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => handleCall(hospitalPhone, 'Hospital')}
          accessibilityRole="button">
          <View style={[styles.contactIcon, styles.hospitalIcon]}>
            <Building2 size={24} color={Colors.primary[600]} />
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>Call Hospital</Text>
            <Text style={styles.contactNumber}>
              {hospitalPhone || 'Contact unavailable'}
            </Text>
          </View>

          <Phone size={20} color={Colors.primary[600]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() =>
            handleCall(
              emergencyContact?.phone,
              emergencyContact?.name || 'Emergency Contact',
            )
          }
          accessibilityRole="button">
          <View style={[styles.contactIcon, styles.personalIcon]}>
            <User size={24} color={Colors.success[600]} />
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>
              {emergencyContact?.name || 'Emergency Contact'}
            </Text>

            <Text style={styles.contactNumber}>
              {emergencyContact?.phone || 'No emergency contact added'}
            </Text>

            {!!emergencyContact?.relation && (
              <Text style={styles.contactRelation}>
                {emergencyContact.relation}
              </Text>
            )}
          </View>

          <Phone size={20} color={Colors.success[600]} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Hospital Location</Text>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <MapPin size={20} color={Colors.primary[600]} />

            <View style={styles.locationInfo}>
              <Text style={styles.locationName}>
                {hospitalName || 'Hospital'}
              </Text>

              <Text style={styles.locationAddress}>
                {hospitalAddress || 'Hospital address unavailable'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={handleDirections}
            accessibilityRole="button">
            <Navigation size={18} color="#FFFFFF" />
            <Text style={styles.directionsText}>Get Directions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningBox}>
          <Siren size={16} color={Colors.error[500]} />

          <Text style={styles.warningText}>
            For a life-threatening emergency, contact local emergency
            services immediately. Opening the dialer does not notify
            the hospital or dispatch an ambulance.
          </Text>
        </View>
      </ScrollView>
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
    padding: Spacing.base,
  },
  sosButton: {
    backgroundColor: Colors.error[600],
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sosText: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  sosSub: {
    fontSize: FontSize.base,
    color: Colors.error[100],
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  ambulanceIcon: {
    backgroundColor: Colors.error[50],
  },
  hospitalIcon: {
    backgroundColor: Colors.primary[50],
  },
  personalIcon: {
    backgroundColor: Colors.success[50],
  },
  contactInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  contactName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  contactNumber: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  contactRelation: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  locationRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },
  locationAddress: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
    lineHeight: 20,
  },
  directionsBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[600],
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
  },
  warningBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.error[50],
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.error[700],
    lineHeight: 20,
  },
});