import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Home, CalendarDays, FileText, Video, User } from 'lucide-react-native';

import PatientHomeScreen from '../screens/patient/home/PatientHomeScreen';
import PatientAppointmentsScreen from '../screens/patient/appointments/PatientAppointmentsScreen';
import PatientRecordsScreen from '../screens/patient/records/PatientRecordsScreen';
import PatientConsultScreen from '../screens/patient/consult/PatientConsultScreen';
import PatientProfileScreen from '../screens/patient/profile/PatientProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        // tabBarActiveTintColor: Colors.primary[600],
        // tabBarInactiveTintColor: Colors.neutral[400],

        // tabBarStyle: {
        //   backgroundColor: Colors.neutral[0],
        //   borderTopColor: Colors.neutral[100],
        //   height: 60,
        //   paddingBottom: 8,
        // },

        // tabBarLabelStyle: {
        //   fontSize: 11,
        //   fontWeight: '600',
        // },
      }}
    >
      <Tab.Screen
        name="index"
        component={PatientHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="appointments"
        component={PatientAppointmentsScreen}
        options={{
          title: 'Appointment',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="records"
        component={PatientRecordsScreen}
        options={{
          title: 'Records',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="consult"
        component={PatientConsultScreen}
        options={{
          title: 'Consult',
          tabBarIcon: ({ color, size }) => (
            <Video size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="profile"
        component={PatientProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({});