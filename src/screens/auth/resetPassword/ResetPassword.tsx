import React, {useState} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyRound, Lock, Mail} from 'lucide-react-native';
import BackHeader from '../../../components/backHeader/BackHeader';
import {Input} from '../../../components/input/Input';
import CustomButton from '../../../components/customButton/CustomButton';
import {Colors, FontSize, FontWeight, Spacing} from '../../../constants/theme';
import {ColorConstants} from '../../../constants/colorConstants';
import {Fontconstants} from '../../../constants/fontConstants';
import {scale} from '../../../utils/scale';
import {showToast} from '../../../utils/toast';
import axios from 'axios';
import {resetPatientPassword} from '../../../network/api';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../../types';

type FormValues = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<FormValues>({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const navigation =
  useNavigation<NativeStackNavigationProp<RootStackParamList>>();

const [loading, setLoading] = useState(false);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues(previous => ({...previous, [field]: value}));
    setErrors(previous => ({
      ...previous,
      [field]: '',
      ...(field === 'newPassword' ? {confirmPassword: ''} : {}),
    }));
  };


const handleResetPassword = async () => {
  if (loading) return;

  const nextErrors: Partial<FormValues> = {};

  if (!values.email.trim()) {
    nextErrors.email = 'Please enter your email address';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = 'Please enter a valid email address';
  }

  if (!values.otp.trim()) {
    nextErrors.otp = 'Please enter the OTP sent to your email';
  } else if (!/^\d+$/.test(values.otp.trim())) {
    nextErrors.otp = 'OTP must contain only numbers';
  }

  if (!values.newPassword.trim()) {
    nextErrors.newPassword = 'Please enter your new password';
  }

  if (!values.confirmPassword) {
    nextErrors.confirmPassword = 'Please confirm your new password';
  } else if (values.confirmPassword !== values.newPassword) {
    nextErrors.confirmPassword = 'Passwords do not match';
  }

  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  Keyboard.dismiss();

  try {
    setLoading(true);

    const result = await resetPatientPassword({
      email: values.email.trim(),
      otp: values.otp.trim(),
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    });
    console.log('Reset password result:', result);
    if (result.success === false) {
      showToast(result.message || 'Unable to reset password', 'error');
      return;
    }

    showToast(
      result.message || 'Password reset successfully',
      'success',
    );

    navigation.reset({
      index: 0,
      routes: [{name: 'LoginScreen'}],
    });
  } catch (error: unknown) {
    const message = axios.isAxiosError<{message?: string}>(error)
      ? error.response?.data?.message || error.message
      : error instanceof Error
        ? error.message
        : 'Unable to reset password. Please try again.';

    showToast(message, 'error');
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={[styles.container, {paddingTop: insets.top}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackHeader />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + Spacing.xl},
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Image
          source={require('../../../assets/image/himsLogo.png')}
          style={styles.logo}
          accessibilityLabel="HIMS logo"
        />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and the OTP sent to your email, then choose
          a new password for your healthcare account.
        </Text>
        <View style={styles.form}>
          <Input
            label="Email Address"
            value={values.email}
            onChangeText={value => updateField('email', value)}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.neutral[400]} />}
            error={errors.email}
          />
          <Input
            label="OTP"
            value={values.otp}
            onChangeText={value => updateField('otp', value)}
            placeholder="Enter your OTP"
            keyboardType="number-pad"
            icon={<KeyRound size={20} color={Colors.neutral[400]} />}
            error={errors.otp}
          />
          <Input
            label="New Password"
            value={values.newPassword}
            onChangeText={value => updateField('newPassword', value)}
            placeholder="Enter your new password"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral[400]} />}
            error={errors.newPassword}
          />
          <Input
            label="Confirm Password"
            value={values.confirmPassword}
            onChangeText={value => updateField('confirmPassword', value)}
            placeholder="Confirm your new password"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral[400]} />}
            error={errors.confirmPassword}
          />
          <CustomButton
            title="Reset Password"
            disable={false}
            onPress={handleResetPassword}
            topHeight={Spacing.md}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    backgroundColor: Colors.neutral[50],
  },
  content: {flexGrow: 1},
  logo: {
    width: scale(60),
    height: scale(60),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },
  subtitle: {
    fontSize: FontSize.base,
    color: Colors.neutral[500],
    lineHeight: 24,
    marginTop: Spacing.sm,
  },
  form: {marginTop: Spacing.xl},
});
