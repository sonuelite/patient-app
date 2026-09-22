import React, { useState } from 'react';
// import 'react-native-get-random-values';
// import CryptoJS from 'crypto-js';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  Radius,
  Shadows,
} from '../../../constants/theme';

import { Input } from '../../../components/input/Input';

import {
  Mail,
  Phone,
  Lock,
} from 'lucide-react-native';
import { showToast } from '../../../utils/toast';
import type { RootStackParamList } from '../../../types';
import CustomButton from '../../../components/customButton/CustomButton';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { scale } from '../../../utils/scale';
import BackHeader from '../../../components/backHeader/BackHeader';
import Divider from '../../../components/divider/Divider';
import { patientSignin, verifyPatientPhone } from '../../../network/api';
import { useApp } from '../../../context/AppContext';
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LoginScreen'
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { completeLogin } = useApp();

  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<'email' | 'mobile'>('email');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (!normalizedPassword) {
      showToast('Please enter your password', 'error');
      return;
    }

    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const response = await patientSignin({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (!response?.success) {
        showToast(response?.message || 'Unable to sign in', 'error');
        return;
      }

      const accessToken = response?.data?.accessToken || response?.accessToken;

      if (typeof accessToken !== 'string' || !accessToken.trim()) {
        showToast('Access token was not received from the server', 'error');
        return;
      }

      await completeLogin(accessToken);

      showToast(response?.message || 'Login successful', 'success');

    } catch (error: any) {
      console.log(
        'Patient sign-in error:',
        JSON.stringify(error?.response?.data || error?.message, null, 2),
      );

      console.log('Patient sign-in status:', error?.response?.status);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Invalid email or password';

      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

const handleSendOtp = async () => {
  if (otpLoading) { return; }
  const phone = mobile.trim();

  if (!/^\d{10}$/.test(phone)) {
    showToast(
      'Please enter a valid 10-digit mobile number',
      'error',
    );
    return;
  }

  try {
    setOtpLoading(true);

    const response = await verifyPatientPhone({
      phone,
    });

    console.log('MobileVerify response:', response);

    if (!response?.success || !response?.isValid) {
      showToast(
        response?.message || 'Phone number is not valid',
        'error',
      );
      return;
    }

    showToast(
      response.message || 'Phone number verified',
      'success',
    );

    navigation.navigate('Otp', {
      phone: response.data?.phone || phone,
    });
  } catch (error: any) {
    showToast(
      error?.response?.data?.message ||
        'Unable to verify phone number',
      'error',
    );
  } finally {
    setOtpLoading(false);
  }
};

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      <BackHeader />

      <ScrollView
        // contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Image
            source={require('../../../assets/image/himsLogo.png')}
            style={styles.himsLogoStyle}
          />
        </View>

        <Text style={styles.title}>Sign In</Text>

        <Text style={styles.subtitle}>Access your healthcare account</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            onPress={() => {
              setMode('email');
              setShowOTP(false);
              setOtp('');
            }}
            style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'email' && styles.modeTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode('mobile');
              setPassword('');
            }}
            style={[styles.modeBtn, mode === 'mobile' && styles.modeBtnActive]}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'mobile' && styles.modeTextActive,
              ]}
            >
              Mobile + OTP
            </Text>
          </TouchableOpacity>
        </View>
        {mode === 'email' ? (
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            icon={<Mail size={20} color={Colors.neutral[400]} />}
          />
        ) : (
          <>
            <Input
              label="Mobile Number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              icon={<Phone size={20} color={Colors.neutral[400]} />}
            />

            {showOTP && (
              <Input
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                placeholder="1234"
                keyboardType="numeric"
              />
            )}
          </>
        )}
        {mode === 'email' && (
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            icon={<Lock size={20} color={Colors.neutral[400]} />}
          />
        )}
        <TouchableOpacity
          onPress={() => showToast('Password reset link sent (demo)', 'info')}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {mode === 'mobile' && !showOTP && (
          <CustomButton
            disable={otpLoading}
            title={otpLoading ? 'Sending...' : 'Send OTP'}
            topHeight={22}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={handleSendOtp}
          />
        )}

        <View
          style={{
            height: mode === 'mobile' && !showOTP ? 0 : Spacing.md,
          }}
        />
        {/* {mode === 'email' && (
          <CustomButton
            disable={false}
            title="Sign In"
            topHeight={22}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={handleLogin}
          />
        )} */}
        {mode === 'email' && (
          <View style={styles.signInButtonContainer}>
            <CustomButton
              disable={loading}
              title={loading ? '' : 'Sign In'}
              topHeight={0}
              bgColor={ColorConstants.BTNCOLOR}
              fontsize={14}
              fontfamily={Fontconstants.SEMIBOLD}
              bordRadius={scale(12)}
              onPress={handleLogin}
            />

            {loading && (
              <View pointerEvents="none" style={styles.signInLoaderContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
          </View>
        )}
        {showOTP && mode === 'mobile' && (
          <CustomButton
            disable={false}
            title="Verify & Login"
            topHeight={22}
            bgColor={ColorConstants.BLACK}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={() => console.log('Verify & Login')}
          />
        )}
        <Divider txt="OR" topHeight={24} />

        <View style={styles.registerView}>
          <Text style={styles.dontAccountTxt}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.registerTxt}>Register</Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          disable={false}
          title="Continue as Guest (Demo)"
          topHeight={14}
          bgColor={Colors.neutral[200]}
          txtColor={ColorConstants.BLACK}
          fontsize={14}
          fontfamily={Fontconstants.SEMIBOLD}
          bordRadius={scale(12)}
          onPress={() => console.log('Continue as Guest (Demo)')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    backgroundColor: Colors.neutral[50],
  },
  himsLogoStyle: {
    width: scale(60),
    height: scale(60),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },

  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
  },

  subtitle: {
    fontSize: FontSize.base,
    color: Colors.neutral[400],
    marginTop: Spacing.xs,
  },

  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.lg,
  },

  modeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral[100],
    borderRadius: Radius.md,
    padding: 3,
    marginVertical: Spacing.md,
  },

  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.md - 2,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },

  modeBtnActive: {
    backgroundColor: Colors.neutral[0],
    ...Shadows.sm,
  },

  modeText: {
    fontSize: FontSize.sm,
    color: Colors.neutral[500],
    fontWeight: FontWeight.medium,
  },

  modeTextActive: {
    color: Colors.primary[700],
    fontWeight: FontWeight.semibold,
  },

  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary[600],
    fontWeight: FontWeight.semibold,
    textAlign: 'right',
    marginBottom: Spacing.lg,
  },
  registerView: {
    flexDirection: 'row',
    marginTop: scale(16),
    alignSelf: 'center',
  },
  dontAccountTxt: {
    fontSize: 14,
    fontFamily: Fontconstants.MEDIUM,
    color: ColorConstants.GRAY_Heading,
  },
  registerTxt: {
    fontSize: 14,
    fontFamily: Fontconstants.BOLD,
    color: ColorConstants.BTNCOLOR,
  },
  signInButtonContainer: {
    position: 'relative',
    marginTop: scale(22),
  },

  signInLoaderContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
