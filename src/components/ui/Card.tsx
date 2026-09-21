import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
  FontSize,
  FontWeight,
  Shadows,
  ShadowKey,
} from '../../constants/theme';


interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  padding?: number;
  shadow?: ShadowKey;
}

export function Card({
  children,
  onPress,
  style,
  padding = Spacing.base,
  shadow = 'sm',
}: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={[
          styles.card,
          {padding},
          style,
          Shadows[shadow],
        ]}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {padding},
        style,
        Shadows[shadow],
      ]}>
      {children}
    </View>
  );
}

interface BadgeProps {
  label: string;
  color?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  color = 'primary',
  size = 'sm',
}: BadgeProps) {
  const colors = {
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
      text: Colors.neutral[600],
    },
  }[color];

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: colors.bg},
        size === 'md' && styles.badgeMd,
      ]}>
      <Text
        style={[
          styles.badgeText,
          {color: colors.text},
          size === 'md' && styles.badgeTextMd,
        ]}>
        {label}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionAccent} />

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        {icon}
      </View>

      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      <Text style={styles.emptyMessage}>
        {message}
      </Text>

      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.emptyAction}>
          <Text style={styles.emptyActionText}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
  },

  badge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },

  badgeMd: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },

  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  badgeTextMd: {
    fontSize: FontSize.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  sectionAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: Colors.primary[600],
  },

  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  sectionAction: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
  },

  empty: {
    alignItems: 'center',
    paddingVertical:
      Spacing.xxxl + Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },

  emptyIcon: {
    marginBottom: Spacing.base,
  },

  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
    textAlign: 'center',
    lineHeight: 22,
  },

  emptyAction: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[50],
    borderRadius: Radius.md,
  },

  emptyActionText: {
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.base,
  },
});
