import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react-native';

type FlashCardType = 'critical' | 'warning' | 'info';

interface FlashCardProps {
  title: string;
  message: string;
  type?: FlashCardType;
  onClose?: () => void;
}

const config = {
  critical: {
    background: '#FFF1F0',
    color: '#C62828',
    icon: AlertTriangle,
    label: 'HIGH PRIORITY',
  },
  warning: {
    background: '#FFF8E6',
    color: '#B45309',
    icon: AlertCircle,
    label: 'MEDIUM PRIORITY',
  },
  info: {
    background: '#EFF6FF',
    color: '#2563EB',
    icon: Info,
    label: 'INFO',
  },
};

const FlashCard = ({
  title,
  message,
  type = 'info',
  onClose,
}: FlashCardProps) => {
  const theme = config[type];
  const Icon = theme.icon;

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: theme.background},
      ]}>
      <View style={styles.header}>
        <Icon size={24} color={theme.color} />

        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, {color: theme.color}]}>
            {title}
          </Text>
          {/* <Text
            style={[styles.priority, {color: theme.color}]}>
            {theme.label}
          </Text> */}
        </View>

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss alert">
            <X size={20} color={theme.color} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  priority: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginTop: 12,
    lineHeight: 21,
  },
});

export default FlashCard;