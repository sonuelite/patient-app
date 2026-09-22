import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Signup from '../screens/auth/signup/Signup';
import LoginScreen from '../screens/auth/signIn/LoginScreen';
import Otp from '../screens/auth/otp/Otp';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const { authLoading, isLoggedIn } = useApp();
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
        <Stack.Screen name="PatientTabs" component={BottomTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
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
