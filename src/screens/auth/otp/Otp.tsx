import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../../../constants/theme';
import { scale } from '../../../utils/scale';
import { RootStackParamList } from '../../../types';
import CustomButton from '../../../components/customButton/CustomButton';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { showToast } from '../../../utils/toast';
import { verifyPatientOtp } from '../../../network/api';

type OTPNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Otp'>;
type OTPRouteProp = RouteProp<RootStackParamList, 'Otp'>;

const Otp = () => {
  const navigation = useNavigation<OTPNavigationProp>();
  const route = useRoute<OTPRouteProp>();

  const { phone } = route.params;

  const [otp, setOtp] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const isKeyboardVisibleRef = useRef(false);

  /**
   * Track keyboard status cleanly
   */
  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      isKeyboardVisibleRef.current = true;
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      isKeyboardVisibleRef.current = false;
      inputRef.current?.blur();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  /**
   * Handle OTP input
   */
  const handleOTPChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');

    if (numericValue.length <= 6) {
      setOtp(numericValue);
      setActiveIndex(numericValue.length < 6 ? numericValue.length : 5);
    }
  };

  /**
   * Handle OTP box press
   * If keyboard is already visible, keep it open and only switch index.
   * If keyboard is closed, open it.
   */
  const handleOtpBoxPress = (index: number) => {
    setActiveIndex(index);

    if (!isKeyboardVisibleRef.current) {
      inputRef.current?.focus();
    }
  };

  /**
   * Verify OTP
   */
  // const handleVerify = () => {
  //   if (otp.length !== 6) {
  //     console.log('Please enter a valid OTP');
  //     return;
  //   }

  //   console.log('OTP:', otp);
  //   navigation.replace('PatientTabs');
  // };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    if (verifyLoading) {
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await verifyPatientOtp({
        phone,
        otp,
      });

      console.log('Verify OTP response:', response);

      if (!response?.success || response?.isValid === false) {
        showToast(response?.message || 'Invalid OTP', 'error');
        return;
      }

      showToast(response?.message || 'OTP verified successfully', 'success');

      navigation.replace('PatientTabs');
    } catch (error: any) {
      console.log('Verify OTP error:', error?.response?.data || error?.message);

      showToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to verify OTP',
        'error',
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResend = () => {
    setOtp('');
    setActiveIndex(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    console.log('OTP resent');
  };

  useEffect(() => {
    showToast('Your Otp 123456', 'info');
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Verify OTP</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We have sent a 6-digit verification code to your mobile number.
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {Array.from({ length: 6 }).map((_, index) => {
            const isActive = keyboardVisible && index === activeIndex;

            return (
              <TouchableWithoutFeedback
                key={index}
                onPress={() => handleOtpBoxPress(index)}
              >
                <View style={[styles.otpBox, isActive && styles.activeOtpBox]}>
                  <Text style={styles.otpText}>{otp[index] || ''}</Text>
                </View>
              </TouchableWithoutFeedback>
            );
          })}

          {/* Hidden actual TextInput */}
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOTPChange}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            caretHidden
            showSoftInputOnFocus={true}
            style={styles.input}
          />
        </View>

        {/* Verify Button */}
        {/* <CustomButton
          disable={otp.length !== 6}
          title="Verify"
          topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          onPress={handleVerify}
        /> */}
        <CustomButton
          disable={otp.length !== 6 || verifyLoading}
          title={verifyLoading ? 'Verifying...' : 'Verify'}
          topHeight={30}
          bgColor={ColorConstants.BTNCOLOR}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          onPress={handleVerify}
        />

        {/* Resend OTP */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>

          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendButton}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Otp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },

  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(10),
    position: 'relative',
    marginBottom: Spacing.xl,
  },

  otpBox: {
    width: scale(45),
    height: scale(50),
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: scale(10),
    backgroundColor: Colors.neutral[0],
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeOtpBox: {
    borderColor: Colors.primary[600],
    borderWidth: 2,
  },

  otpText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[900],
  },

  input: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
  },

  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },

  resendText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
  },

  resendButton: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
  },
});
