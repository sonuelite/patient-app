import React, {useEffect} from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectAuthLoading, selectIsLoggedIn} from '../store/selectors';
import {restoreAuth} from '../store/authSlice';
import {showToast} from '../utils/toast';
import type { RootStackParamList } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from '../screens/auth/signup/Signup';
import LoginScreen from '../screens/auth/signIn/LoginScreen';
import ForgotPassword from '../screens/auth/forgotPassword/ForgotPassword';
import Otp from '../screens/auth/otp/Otp';
import BottomTabNavigator from './BottomTabNavigator';
import FamilyMembersScreen from '../screens/patient/profile/familyMembers/FamilyMembers';
import FindDoctorScreen from '../screens/quickActions/bookVisit/FindDoctorScreen';
import DoctorProfileScreen from '../screens/quickActions/bookVisit/DoctorProfileScreen';
import BookAppointmentScreen from '../screens/quickActions/bookVisit/BookAppointmentScreen';
import AddPatient from '../screens/patient/profile/familyMembers/AddPatient';
import PharmacyScreen from '../screens/quickActions/pharmacy/Pharmacy';
import EmergencyScreen from '../screens/quickActions/emergency/Emergency';
import BillingScreen from '../screens/quickActions/billing/Billing';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const dispatch = useAppDispatch();
  const authLoading = useAppSelector(selectAuthLoading);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  useEffect(() => {
    const restore = async () => {
      const result = await dispatch(restoreAuth());
      if (restoreAuth.rejected.match(result) && !result.meta.condition) {
        showToast(result.payload || 'Unable to restore your session', 'error');
      }
    };
    restore();
  }, [dispatch]);
  if (authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="PatientTabs" component={BottomTabNavigator} />
          <Stack.Screen name="FamilyMembers" component={FamilyMembersScreen} />
          <Stack.Screen name="FindDoctor" component={FindDoctorScreen} />
          <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen}/>
          <Stack.Screen name="BookAppointment" component={BookAppointmentScreen}/>
          <Stack.Screen name="AddPatient" component={AddPatient} />
          <Stack.Screen name="PharmacyScreen" component={PharmacyScreen}/>
          <Stack.Screen name="EmergencyScreen" component={EmergencyScreen}/>
          <Stack.Screen name="BillingScreen" component={BillingScreen}/>
        </>
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Otp" component={Otp} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
