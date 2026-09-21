import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
} from '../../../constants/theme';

import { Avatar } from '../../../components/ui/DataDisplay';

import {
  User,
  FileText,
  Heart,
  Shield,
  Users,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Pill,
} from 'lucide-react-native';

import { useApp } from '../../../context/AppContext';

export default function PatientProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    currentPatientId,
    patients,
    logout,
    medicationReminders,
  } = useApp();

  const patient =
    patients.find(p => p.id === currentPatientId) || patients[0];

  const menuItems = [
    {
      icon: User,
      label: 'Personal Information',
      route: 'ProfileDetail',
    },
    {
      icon: Heart,
      label: 'Medical Information',
      route: 'ProfileDetail',
    },
    {
      icon: Shield,
      label: 'Emergency Contact',
      route: 'ProfileDetail',
    },
    {
      icon: FileText,
      label: 'Insurance',
      route: 'ProfileDetail',
    },
    {
      icon: Users,
      label: 'Family Members',
      route: 'FamilyMembers',
    },
    {
      icon: Pill,
      label: 'Medication Reminders',
      route: 'MedicationReminders',
      badge: medicationReminders.filter(
        r => r.patientId === patient.id && r.active,
      ).length,
    },
    {
      icon: Settings,
      label: 'Preferences',
      route: 'ProfileDetail',
    },
    {
      icon: Bell,
      label: 'Notifications',
      route: 'Notifications',
    },
    {
      icon: Lock,
      label: 'Privacy',
      route: 'ProfileDetail',
    },
    {
      icon: HelpCircle,
      label: 'Help & Support',
      route: 'ProfileDetail',
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();

            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + Spacing.lg,
            },
          ]}
        >
          <View style={styles.profileRow}>
            <Avatar
              uri={patient.photo}
              size={72}
              name={patient.name}
            />

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {patient.name}
              </Text>

              <Text style={styles.profileId}>
                {patient.id} · {patient.gender}, {patient.age}y
              </Text>

              <Text style={styles.profileBlood}>
                Blood: {patient.bloodGroup}
              </Text>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Statistics */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patient.vitals.length}
              </Text>

              <Text style={styles.statLabel}>
                Vitals
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patient.conditions.length}
              </Text>

              <Text style={styles.statLabel}>
                Conditions
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {patient.familyMembers.length}
              </Text>

              <Text style={styles.statLabel}>
                Family
              </Text>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 &&
                      styles.lastMenuItem,
                  ]}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <Icon
                        size={20}
                        color={Colors.primary[600]}
                      />
                    </View>

                    <Text style={styles.menuLabel}>
                      {item.label}
                    </Text>
                  </View>

                  <View style={styles.menuRight}>
                    {item.badge ? (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>
                          {item.badge}
                        </Text>
                      </View>
                    ) : null}

                    <ChevronRight
                      size={18}
                      color={Colors.neutral[300]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut
              size={20}
              color={Colors.error[600]}
            />

            <Text style={styles.logoutText}>
              Logout
            </Text>
          </TouchableOpacity>

          <Text style={styles.version}>
            MediCare v1.0.0
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
    paddingBottom: 100,
  },

  header: {
    backgroundColor: Colors.primary[700],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  profileName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[0],
  },

  profileId: {
    fontSize: FontSize.sm,
    color: Colors.primary[200],
    marginTop: 2,
  },

  profileBlood: {
    fontSize: FontSize.sm,
    color: Colors.primary[300],
    marginTop: 2,
  },

  body: {
    padding: Spacing.base,
    paddingTop: Spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    backgroundColor: Colors.neutral[100],
  },

  menuList: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  menuLabel: {
    fontSize: FontSize.base,
    color: Colors.neutral[800],
    fontWeight: FontWeight.medium,
  },

  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  menuBadge: {
    backgroundColor: Colors.primary[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },

  menuBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.error[50],
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },

  logoutText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.error[600],
  },

  version: {
    textAlign: 'center',
    fontSize: FontSize.xs,
    color: Colors.neutral[300],
    marginTop: Spacing.lg,
  },
});