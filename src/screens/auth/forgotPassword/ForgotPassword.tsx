import React, { useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import BackHeader from '../../../components/backHeader/BackHeader';
import { Input } from '../../../components/input/Input';
import CustomButton from '../../../components/customButton/CustomButton';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../../../constants/theme';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { scale } from '../../../utils/scale';
import { showToast } from '../../../utils/toast';
import axios from 'axios';
import {forgotPatientPassword} from '../../../network/api';

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

//   const handleSubmit = () => {
//     const normalizedEmail = email.trim();
//     if (!normalizedEmail) {
//       setError('Please enter your email address');
//       return;
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
//       setError('Please enter a valid email address');
//       return;
//     }
//     setError('');
//     Keyboard.dismiss();
//     // Connect the password-reset API here when it is available.
//     showToast(
//       'Password reset is not available yet. Please contact support.',
//       'info',
//     );
//   };

const handleSubmit = async () => {
    console.log('handleSubmit');
  if (submitting.current) {
    return;
  }

  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    setError('Please enter your email address');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    setError('Please enter a valid email address');
    return;
  }

  setError('');
  Keyboard.dismiss();

  submitting.current = true;
  setLoading(true);

  try {
    const result = await forgotPatientPassword(normalizedEmail);
    console.log('Forgot password result:', result);
    showToast(
      result.message || 'OTP request submitted. Please check your email.',
      'success',
    );
  } catch (err: unknown) {
    const message = axios.isAxiosError(err)
      ? err.response?.data?.message || err.message
      : err instanceof Error
        ? err.message
        : 'Unable to send OTP. Please try again.';
    console.log('Forgot password error:', message);
    showToast(message, 'error');
  } finally {
    submitting.current = false;
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={require('../../../assets/image/himsLogo.png')}
          style={styles.logo}
          accessibilityLabel="HIMS logo"
        />
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter the email address associated with your healthcare account to
          reset your password.
        </Text>
        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={value => {
              setEmail(value);
              setError('');
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.neutral[400]} />}
            error={error}
          />
          {/* <CustomButton
            title="Submit"
            disable={false}
            onPress={handleSubmit}
            topHeight={Spacing.md}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
          /> */}
          <CustomButton
            title={loading ? 'Sending OTP...' : 'Submit'}
            disable={loading}
            onPress={handleSubmit}
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
  content: { flexGrow: 1 },
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
  form: { marginTop: Spacing.xl },
});
