import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
  FontSize,
  FontWeight,
  Shadows,
} from '../../constants/theme';

import {
  Star,
  MapPin,
  Video,
} from 'lucide-react-native';

import type {
  Doctor,
  AppointmentStatus,
  ConsultationType,
  LabStatus,
  BedStatus,
  BillStatus,
} from '../../types';

export function Avatar({
  uri,
  size = 48,
  name,
}: {
  uri?: string;
  size?: number;
  name?: string;
}) {
  if (uri) {
    return (
      <Image
        source={{uri}}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  const initials =
    name
      ?.split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('') ?? '?';

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}>
      <Text
        style={[
          styles.avatarText,
          {
            fontSize: size * 0.4,
          },
        ]}>
        {initials}
      </Text>
    </View>
  );
}

export function DoctorCard({
  doctor,
  onPress,
}: {
  doctor: Doctor;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.doctorCard}>
      <Avatar
        uri={doctor.photo}
        size={56}
        name={doctor.name}
      />

      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>
          {doctor.name}
        </Text>

        <Text style={styles.doctorSpec}>
          {doctor.specialty}
        </Text>

        <View style={styles.doctorMeta}>
          <View style={styles.metaItem}>
            <Star
              size={13}
              color={Colors.warning[500]}
              fill={Colors.warning[500]}
            />

            <Text style={styles.metaText}>
              {doctor.rating}
            </Text>
          </View>

          <Text style={styles.dot}>•</Text>

          <Text style={styles.metaText}>
            {doctor.experience} yrs
          </Text>
        </View>

        <Text style={styles.doctorFee}>
          ₹{doctor.consultationFee}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function AppointmentCard({
  appointment,
  onPress,
}: {
  appointment: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.apptCard}>
      <View style={styles.apptLeft}>
        <Text style={styles.apptTime}>
          {appointment.time}
        </Text>

        <Text style={styles.apptDate}>
          {appointment.date}
        </Text>
      </View>

      <View style={styles.apptDivider} />

      <View style={styles.apptBody}>
        <Text style={styles.apptDoctor}>
          {appointment.doctorName}
        </Text>

        <Text style={styles.apptDept}>
          {appointment.department}
        </Text>

        <View style={styles.apptMetaRow}>
          {appointment.consultationType === 'video' ||
          appointment.consultationType === 'online' ? (
            <Video
              size={12}
              color={Colors.primary[600]}
            />
          ) : (
            <MapPin
              size={12}
              color={Colors.neutral[500]}
            />
          )}

          <Text style={styles.apptMode}>
            {appointment.consultationType.toUpperCase()}
          </Text>
        </View>
      </View>

      <StatusBadge status={appointment.status} />
    </TouchableOpacity>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      color:
        | 'primary'
        | 'success'
        | 'warning'
        | 'error'
        | 'info'
        | 'neutral';
      label: string;
    }
  > = {
    pending: {
      color: 'warning',
      label: 'Pending',
    },

    confirmed: {
      color: 'primary',
      label: 'Confirmed',
    },

    'checked-in': {
      color: 'info',
      label: 'Checked In',
    },

    'in-consultation': {
      color: 'warning',
      label: 'In Consultation',
    },

    completed: {
      color: 'success',
      label: 'Completed',
    },

    cancelled: {
      color: 'error',
      label: 'Cancelled',
    },

    'no-show': {
      color: 'error',
      label: 'No Show',
    },

    ordered: {
      color: 'warning',
      label: 'Ordered',
    },

    collected: {
      color: 'info',
      label: 'Collected',
    },

    processing: {
      color: 'warning',
      label: 'Processing',
    },

    verified: {
      color: 'primary',
      label: 'Verified',
    },

    available: {
      color: 'success',
      label: 'Available',
    },

    scheduled: {
      color: 'primary',
      label: 'Scheduled',
    },

    occupied: {
      color: 'error',
      label: 'Occupied',
    },

    reserved: {
      color: 'warning',
      label: 'Reserved',
    },

    cleaning: {
      color: 'info',
      label: 'Cleaning',
    },

    maintenance: {
      color: 'neutral',
      label: 'Maintenance',
    },

    blocked: {
      color: 'error',
      label: 'Blocked',
    },

    paid: {
      color: 'success',
      label: 'Paid',
    },

    partial: {
      color: 'warning',
      label: 'Partial',
    },

    insurance: {
      color: 'primary',
      label: 'Insurance',
    },

    draft: {
      color: 'neutral',
      label: 'Draft',
    },

    finalized: {
      color: 'success',
      label: 'Finalized',
    },

    dispensed: {
      color: 'info',
      label: 'Dispensed',
    },

    admitted: {
      color: 'error',
      label: 'Admitted',
    },

    discharged: {
      color: 'success',
      label: 'Discharged',
    },

    waiting: {
      color: 'warning',
      label: 'Waiting',
    },

    'in-treatment': {
      color: 'primary',
      label: 'In Treatment',
    },

    referred: {
      color: 'info',
      label: 'Referred',
    },

    requested: {
      color: 'warning',
      label: 'Requested',
    },

    approved: {
      color: 'primary',
      label: 'Approved',
    },

    surgery: {
      color: 'error',
      label: 'In Surgery',
    },

    recovery: {
      color: 'info',
      label: 'Recovery',
    },

    rejected: {
      color: 'error',
      label: 'Rejected',
    },

    settled: {
      color: 'success',
      label: 'Settled',
    },
  };

  const {
    color,
    label,
  } = config[status] || {
    color: 'neutral' as const,
    label: status,
  };

  const badgeColors = {
    primary: {
      bg: Colors.primary[50],
      text: Colors.primary[700],
    },

    success: {
      bg: Colors.success[50],
      text: Colors.success[700],
    },

    warning: {
      bg: Colors.warning[50],
      text: Colors.warning[700],
    },

    error: {
      bg: Colors.error[50],
      text: Colors.error[700],
    },

    info: {
      bg: Colors.neutral[100],
      text: Colors.neutral[600],
    },

    neutral: {
      bg: Colors.neutral[100],
      text: Colors.neutral[500],
    },
  };

  const colors = badgeColors[color];

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: colors.bg,
        },
      ]}>
      <Text
        style={[
          styles.statusText,
          {
            color: colors.text,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

export function VitalCard({
  label,
  value,
  unit,
  icon,
  color = 'primary',
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    primary: Colors.primary[50],
    success: Colors.success[50],
    warning: Colors.warning[50],
    error: Colors.error[50],
    accent: Colors.accent[50],
  };

  return (
    <View
      style={[
        styles.vitalCard,
        {
          backgroundColor:
            colors[color] || Colors.primary[50],
        },
      ]}>
      <View style={styles.vitalIcon}>
        {icon}
      </View>

      <Text style={styles.vitalLabel}>
        {label}
      </Text>

      <Text style={styles.vitalValue}>
        {value}
      </Text>

      {unit && (
        <Text style={styles.vitalUnit}>
          {unit}
        </Text>
      )}
    </View>
  );
}

export function TimelineItem({
  date,
  title,
  subtitle,
  isLast,
  icon,
}: {
  date: string;
  title: string;
  subtitle?: string;
  isLast?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDot}>
          {icon}
        </View>

        {!isLast && (
          <View style={styles.timelineLine} />
        )}
      </View>

      <View style={styles.timelineContent}>
        <Text style={styles.timelineDate}>
          {date}
        </Text>

        <Text style={styles.timelineTitle}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.timelineSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <View style={styles.stepper}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <View style={styles.step}>
            <View
              style={[
                styles.stepCircle,
                i <= current
                  ? styles.stepActive
                  : null,
                i < current
                  ? styles.stepDone
                  : null,
              ]}>
              <Text
                style={[
                  styles.stepText,
                  i <= current
                    ? styles.stepTextActive
                    : null,
                ]}>
                {i < current ? '✓' : i + 1}
              </Text>
            </View>

            <Text
              style={[
                styles.stepLabel,
                i <= current
                  ? styles.stepLabelActive
                  : null,
              ]}>
              {step}
            </Text>
          </View>

          {i < steps.length - 1 && (
            <View
              style={[
                styles.stepConnector,
                i < current
                  ? styles.stepConnectorActive
                  : null,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarFallback: {
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: Colors.primary[700],
    fontWeight: FontWeight.bold,
  },

  doctorCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },

  doctorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  doctorName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  doctorSpec: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  doctorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  metaText: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    fontWeight: FontWeight.medium,
  },

  dot: {
    color: Colors.neutral[300],
    fontSize: FontSize.sm,
  },

  doctorFee: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.primary[700],
    marginTop: 2,
  },

  apptCard: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },

  apptLeft: {
    width: 70,
  },

  apptTime: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  apptDate: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  apptDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral[200],
    marginHorizontal: Spacing.md,
  },

  apptBody: {
    flex: 1,
  },

  apptDoctor: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  apptDept: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  apptMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },

  apptMode: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    fontWeight: FontWeight.medium,
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
  },

  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  vitalCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    alignItems: 'center',
    minWidth: 100,
  },

  vitalIcon: {
    marginBottom: Spacing.xs,
  },

  vitalLabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[600],
    fontWeight: FontWeight.medium,
  },

  vitalValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginTop: 2,
  },

  vitalUnit: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
  },

  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },

  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary[500],
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral[200],
    marginTop: Spacing.xs,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },

  timelineDate: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    fontWeight: FontWeight.medium,
  },

  timelineTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
    marginTop: 2,
  },

  timelineSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  step: {
    alignItems: 'center',
    width: 60,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },

  stepActive: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },

  stepDone: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
  },

  stepText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[400],
  },

  stepTextActive: {
    color: Colors.primary[700],
  },

  stepLabel: {
    fontSize: 9,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: FontWeight.medium,
  },

  stepLabelActive: {
    color: Colors.primary[700],
  },

  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.neutral[200],
    marginBottom: Spacing.xl,
  },

  stepConnectorActive: {
    backgroundColor: Colors.primary[500],
  },
});
