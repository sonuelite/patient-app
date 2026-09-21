import React from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'number-pad' | 'decimal-pad';
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  style?: any;
}

export function Input({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, error, icon, multiline, style,
}: InputProps) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.inputError : null, icon ? styles.withIcon : null]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, multiline && styles.multiline, style]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral[400]}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          autoCapitalize={multiline ? 'sentences' : 'none'}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff size={20} color={Colors.neutral[400]} /> : <Eye size={20} color={Colors.neutral[400]} />}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  withIcon: { paddingLeft: Spacing.md },
  icon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.neutral[900],
    paddingVertical: Spacing.md,
  },
  inputWithIcon: { paddingLeft: 0 },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  inputError: { borderColor: Colors.error[400] },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error[500],
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  eyeIcon: { padding: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.neutral[200],
    backgroundColor: Colors.neutral[0],
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[500],
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[600],
    fontWeight: FontWeight.medium,
  },
  chipTextSelected: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },
});
