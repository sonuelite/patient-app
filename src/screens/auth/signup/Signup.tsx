import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { scale } from '../../../utils/scale';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BackHeader from '../../../components/backHeader/BackHeader';
import { Chip, Input } from '../../../components/input/Input';
import CustomButton from '../../../components/customButton/CustomButton';
import { ColorConstants } from '../../../constants/colorConstants';
import { Fontconstants } from '../../../constants/fontConstants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { registerPatient } from '../../../network/api';
import { showToast } from '../../../utils/toast';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

const Signup = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    // name: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    mobile: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState('');
  const update = (key: string, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  //   const handleNext = () => {
  //     // if (!form.name || !form.dob || !form.mobile) {
  //     if (
  //       !form.firstName ||
  //       !form.lastName ||
  //       !form.dob ||
  //       !form.mobile ||
  //       !form.password
  //     ) {
  //       console.log('Please fill all required fields');
  //       return;
  //     }

  //     handleSubmit();
  //   };

  const handleNext = () => {
    const mobileNumber = form.mobile.replace(/\D/g, '');

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dob.trim() ||
      !form.mobile.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (mobileNumber.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    if (form.password.length < 6) {
      showToast('Password must contain at least 6 characters', 'error');
      return;
    }

    handleSubmit();
  };
  //   const handleSubmit = () => {
  //     const patient = {
  //       //   name: form.name,
  //       firstName: form.firstName,
  //       lastName: form.lastName,
  //       dob: form.dob,
  //       gender: form.gender,
  //       mobile: form.mobile,
  //       email: form.email,
  //       password: form.password,
  //     };
  //     navigation.navigate('Otp');
  //   };
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const patientData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.mobile.trim(),
        email: form.email.trim(),
        gender: form.gender,
        dob: form.dob.trim(),
        password: form.password,
      };

      const response = await registerPatient(patientData);
      console.log("registerPatient res",response);
      
      showToast(
        response.message || 'Patient registered successfully',
        'success',
      );

      // navigation.navigate('Otp');
    }  catch (error: any) {
  const errorData = error.response?.data;

  console.log(
    'Registration error data:',
    JSON.stringify(errorData, null, 2),
  );

  console.log(
    'Registration status:',
    error.response?.status,
  );

  const message =
    errorData?.message ||
    errorData?.error ||
    'Patient registration failed';

  showToast(message, 'error');
} finally {
      setLoading(false);
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
      <BackHeader title="Patient Registration" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Details</Text>
            <Input
              label="Full Name *"
              value={form.firstName}
              onChangeText={v => update('firstName', v)}
              placeholder="Enter first name"
            />
            <Input
              label="Full Name *"
              value={form.lastName}
              onChangeText={v => update('lastName', v)}
              placeholder="Enter last name"
            />
            <Input
              label="Date of Birth *"
              value={form.dob}
              onChangeText={v => update('dob', v)}
              placeholder="YYYY-MM-DD"
            />
            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {(['Male', 'Female', 'Other'] as const).map(g => (
                <Chip
                  key={g}
                  label={g}
                  selected={form.gender === g}
                  onPress={() => update('gender', g)}
                />
              ))}
            </View>
            <Input
              label="Mobile Number *"
              value={form.mobile}
              onChangeText={v => update('mobile', v)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={v => update('email', v)}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Password *"
              value={form.password}
              onChangeText={value => update('password', value)}
              placeholder="Enter your password"
              secureTextEntry
            />
          </View>
          <CustomButton
            // disable={false}
            // title="Continue"
            disable={loading}
            title={loading ? 'Registering...' : 'Continue'}
            topHeight={30}
            bgColor={ColorConstants.BTNCOLOR}
            fontsize={14}
            fontfamily={Fontconstants.SEMIBOLD}
            bordRadius={scale(12)}
            onPress={handleNext}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(24),
    backgroundColor: Colors.neutral[50],
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  stepTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
  },
  stepContent: { paddingTop: Spacing.md },
});
