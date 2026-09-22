import React, {useEffect, useRef} from 'react';
import {
  Animated,
  DimensionValue,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AlertCircle,
  CheckCircle,
  Info,
  X,
} from 'lucide-react-native';

import {
  Colors,
  Radius,
  Spacing,
  FontSize,
  FontWeight,
  Shadows,
} from '../../constants/theme';
import { useApp } from '../../context/AppContext';

/* -------------------------------------------------------------------------- */
/*                                    Toast                                   */
/* -------------------------------------------------------------------------- */

export function Toast() {
  const {toast, clearToast} = useApp();
  const insets = useSafeAreaInsets();

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (toast) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(-20);
    }
  }, [toast, opacity, translateY]);

  if (!toast) {
    return null;
  }

  const iconMap = {
    success: (
      <CheckCircle
        size={22}
        color={Colors.success[600]}
      />
    ),
    error: (
      <AlertCircle
        size={22}
        color={Colors.error[600]}
      />
    ),
    info: (
      <Info
        size={22}
        color={Colors.primary[600]}
      />
    ),
  };

  const borderColorMap = {
    success: Colors.success[500],
    error: Colors.error[500],
    info: Colors.primary[500],
  };

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + Spacing.sm,
          opacity,
          borderLeftColor: borderColorMap[toast.type],
          transform: [{translateY}],
        },
      ]}>
      <View style={styles.iconContainer}>
        {iconMap[toast.type]}
      </View>

      <Text style={styles.toastMessage}>
        {toast.message}
      </Text>

      <TouchableOpacity
        style={styles.closeButton}
        activeOpacity={0.7}
        onPress={clearToast}>
        <X
          size={18}
          color={Colors.neutral[400]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Bottom Sheet                                */
/* -------------------------------------------------------------------------- */

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: DimensionValue;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  height = '60%',
}: BottomSheetProps) {
  const slideAnimation = useRef(
    new Animated.Value(600),
  ).current;

  useEffect(() => {
    if (visible) {
      slideAnimation.setValue(600);

      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  const handleClose = () => {
    Animated.timing(slideAnimation, {
      toValue: 600,
      duration: 200,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        onClose();
      }
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.bottomSheetOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.sheet,
            {
              height,
              transform: [
                {
                  translateY: slideAnimation,
                },
              ],
            },
          ]}>
          <View style={styles.handle} />

          {title ? (
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {title}
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClose}>
                <X
                  size={22}
                  color={Colors.neutral[400]}
                />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.sheetContent}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Confirm Dialog                               */
/* -------------------------------------------------------------------------- */

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>
            {title}
          </Text>

          <Text style={styles.dialogMessage}>
            {message}
          </Text>

          <View style={styles.dialogActions}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onCancel}
              style={[
                styles.dialogButton,
                styles.cancelButton,
              ]}>
              <Text style={styles.cancelButtonText}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              style={[
                styles.dialogButton,
                danger
                  ? styles.dangerButton
                  : styles.confirmButton,
              ]}>
              <Text style={styles.confirmButtonText}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.md,
    borderLeftWidth: 4,
    ...Shadows.lg,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  toastMessage: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.neutral[800],
  },
  closeButton: {
    padding: Spacing.xs,
  },
  bottomSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    paddingTop: Spacing.sm,
    backgroundColor: Colors.neutral[0],
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  handle: {
    width: 40,
    height: 4,
    alignSelf: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  sheetContent: {
    flex: 1,
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    backgroundColor: Colors.neutral[0],
    borderRadius: Radius.lg,
    ...Shadows.lg,
  },
  dialogTitle: {
    marginBottom: Spacing.sm,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  dialogMessage: {
    marginBottom: Spacing.lg,
    fontSize: FontSize.base,
    lineHeight: 22,
    color: Colors.neutral[600],
  },
  dialogActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dialogButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    borderRadius: Radius.md,
  },
  cancelButton: {
    backgroundColor: Colors.neutral[100],
  },
  confirmButton: {
    backgroundColor: Colors.primary[600],
  },
  dangerButton: {
    backgroundColor: Colors.error[600],
  },
  confirmButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[0],
  },
  cancelButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
  },
});