import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  NavigationProp,
  ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import {ChevronLeft, Bell} from 'lucide-react-native';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  onBackPress?: () => void;
  notificationRoute?: string;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightIcon,
  onRightPress,
  onBackPress,
  notificationRoute,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  const navigation =
    useNavigation<NavigationProp<ParamListBase>>();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleNotificationPress = () => {
    if (!notificationRoute) {
      return;
    }

    navigation.navigate(notificationRoute);
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing.md,
        },
      ]}>
      <View style={styles.row}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={handleBackPress}>
            <ChevronLeft
              size={24}
              color={Colors.neutral[900]}
            />
          </TouchableOpacity>
        )}

        <View style={styles.titleContainer}>
          <Text
            style={styles.title}
            numberOfLines={1}>
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={styles.subtitle}
              numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            activeOpacity={0.7}
            onPress={onRightPress}>
            {rightIcon}
          </TouchableOpacity>
        ) : null}

        {notificationRoute && !rightIcon ? (
          <TouchableOpacity
            style={styles.rightButton}
            activeOpacity={0.7}
            onPress={handleNotificationPress}>
            <Bell
              size={22}
              color={Colors.neutral[700]}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  subtitle: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.neutral[400],
  },
  rightButton: {
    padding: Spacing.xs,
  },
});