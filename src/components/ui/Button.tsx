import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing, FontSize, FontWeight, Shadows } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: any;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  disabled, loading, icon, fullWidth, style,
}: ButtonProps) {
  const bg = {
    primary: Colors.primary[600],
    secondary: Colors.secondary[600],
    outline: 'transparent',
    ghost: 'transparent',
    danger: Colors.error[600],
    success: Colors.success[600],
  }[variant];

  const textColor = variant === 'outline' || variant === 'ghost' ? Colors.primary[600] : '#fff';
  const borderColor = variant === 'outline' ? Colors.neutral[300] : 'transparent';

  const padding = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.base },
    md: { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing.lg },
    lg: { paddingVertical: Spacing.base, paddingHorizontal: Spacing.xl },
  }[size];

  const fontSize = {
    sm: FontSize.sm,
    md: FontSize.base,
    lg: FontSize.lg,
  }[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: bg, borderColor, padding },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    ...Shadows.sm,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { marginRight: Spacing.xs },
  label: { fontWeight: FontWeight.semibold },
});
