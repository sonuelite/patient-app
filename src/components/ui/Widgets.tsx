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
import { scale } from '../../utils/scale';

interface StatTileProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color:
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'accent'
    | 'teal'
    | 'neutral';
  subtitle?: string;
  trend?: {
    value: string;
    up: boolean;
  };
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StatTile({
  label,
  value,
  icon,
  color,
  subtitle,
  trend,
  onPress,
  size = 'md',
}: StatTileProps) {
  const colorMap: Record<
    string,
    {
      bg: string;
      text: string;
      bgSolid: string;
    }
  > = {
    primary: {
      bg: Colors.primary[50],
      text: Colors.primary[700],
      bgSolid: Colors.primary[600],
    },
    success: {
      bg: Colors.success[50],
      text: Colors.success[700],
      bgSolid: Colors.success[600],
    },
    warning: {
      bg: Colors.warning[50],
      text: Colors.warning[700],
      bgSolid: Colors.warning[600],
    },
    error: {
      bg: Colors.error[50],
      text: Colors.error[700],
      bgSolid: Colors.error[600],
    },
    accent: {
      bg: Colors.accent[50],
      text: Colors.accent[700],
      bgSolid: Colors.accent[600],
    },
    teal: {
      bg: Colors.teal[50],
      text: Colors.teal[700],
      bgSolid: Colors.teal[600],
    },
    neutral: {
      bg: Colors.neutral[100],
      text: Colors.neutral[700],
      bgSolid: Colors.neutral[600],
    },
  };

  const c = colorMap[color];

  const tile = (
    <View
      style={[
        styles.tile,
        size === 'lg' && styles.tileLg,
        !onPress && Shadows.md,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: c.bg }]}>
          {icon}
        </View>

        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trend.up
                  ? Colors.success[50]
                  : Colors.error[50],
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                {
                  color: trend.up
                    ? Colors.success[700]
                    : Colors.error[700],
                },
              ]}
            >
              {trend.up ? '↑' : '↓'} {trend.value}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.value,
          size === 'lg' && styles.valueLg,
        ]}
      >
        {value}
      </Text>

      <Text style={styles.label}>{label}</Text>

      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.touchWrap}
      >
        {tile}
      </TouchableOpacity>
    );
  }

  return tile;
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg?: string;
}

export function InfoRow({
  icon,
  label,
  value,
  iconBg = Colors.neutral[100],
}: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View
        style={[
          styles.infoIcon,
          {
            backgroundColor: iconBg,
          },
        ]}
      >
        {icon}
      </View>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  size = 80,
  strokeWidth = 8,
  progress,
  color = Colors.primary[600],
  bgColor = Colors.neutral[100],
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <View
      style={[
        styles.ringContainer,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <View
        style={[
          styles.ringBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      <View
        style={[
          styles.ringFg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />

      <View style={styles.ringLabel}>
        {label && (
          <Text
            style={[
              styles.ringLabelText,
              {
                fontSize: size * 0.22,
              },
            ]}
          >
            {label}
          </Text>
        )}

        {sublabel && (
          <Text style={styles.ringSublabel}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}

interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  unit?: string;
}

export function MetricBar({
  label,
  value,
  max,
  color = Colors.primary[600],
  unit,
}: MetricBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.metricBar}>
      <View style={styles.metricBarTop}>
        <Text style={styles.metricLabel}>
          {label}
        </Text>

        <Text style={styles.metricValue}>
          {value}
          {unit ? ` ${unit}` : ''} / {max}
          {unit ? ` ${unit}` : ''}
        </Text>
      </View>

      <View style={styles.metricBarTrack}>
        <View
          style={[
            styles.metricBarFill,
            {
              width: `${pct}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  shadow?: ShadowKey;
}

export function SectionCard({
  title,
  icon,
  action,
  onAction,
  children,
  shadow = 'sm',
}: SectionCardProps) {
  return (
    <View style={[styles.sectionCard, Shadows[shadow]]}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionCardTitle}>
          {icon && (
            <View style={styles.sectionCardIcon}>
              {icon}
            </View>
          )}

          <Text style={styles.sectionCardTitleText}>
            {title}
          </Text>
        </View>

        {action && (
          <TouchableOpacity onPress={onAction}>
            <Text style={styles.sectionCardAction}>
              {action}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {children}
    </View>
  );
}

interface PillTagProps {
  label: string;
  color?:
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'neutral'
    | 'teal';
  icon?: React.ReactNode;
}

export function PillTag({
  label,
  color = 'neutral',
  icon,
}: PillTagProps) {
  const colorMap: Record<
    string,
    {
      bg: string;
      text: string;
    }
  > = {
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
    neutral: {
      bg: Colors.neutral[100],
      text: Colors.neutral[600],
    },
    teal: {
      bg: Colors.teal[50],
      text: Colors.teal[700],
    },
  };

  const c = colorMap[color];

  return (
    <View
      style={[
        styles.pillTag,
        {
          backgroundColor: c.bg,
        },
      ]}
    >
      {icon}

      <Text
        style={[
          styles.pillTagText,
          {
            color: c.text,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  touchWrap: {
    width: '48%',
  },

  tile: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    // padding: Spacing.base,
    // width: scale(158),
    // height: scale(158),
    width: scale(165),
    height: scale(165),
    paddingVertical: Spacing.base,
    alignItems: 'center',
    ...Shadows.md,
  },

  tileLg: {
    // padding: Spacing.lg,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },

  trendText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },

  value: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral[900],
  },

  valueLg: {
    fontSize: FontSize.display,
  },

  label: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },

  subtitle: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[50],
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },

  infoLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    fontWeight: FontWeight.medium,
  },

  infoValue: {
    fontSize: FontSize.sm,
    color: Colors.neutral[900],
    fontWeight: FontWeight.semibold,
  },

  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringBg: {
    position: 'absolute',
  },

  ringFg: {
    position: 'absolute',
  },

  ringLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringLabelText: {
    fontWeight: FontWeight.extrabold,
    color: Colors.neutral[900],
  },

  ringSublabel: {
    fontSize: FontSize.xs,
    color: Colors.neutral[400],
    marginTop: 2,
  },

  metricBar: {
    marginBottom: Spacing.md,
  },

  metricBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },

  metricLabel: {
    fontSize: FontSize.sm,
    color: Colors.neutral[700],
    fontWeight: FontWeight.medium,
  },

  metricValue: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.semibold,
  },

  metricBarTrack: {
    height: 8,
    backgroundColor: Colors.neutral[100],
    borderRadius: 4,
    overflow: 'hidden',
  },

  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  sectionCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },

  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  sectionCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  sectionCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionCardTitleText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  sectionCardAction: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
  },

  pillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },

  pillTagText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});