import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from './src/navigator/StackNavigator';
import Toast from 'react-native-toast-message';
import { AppProvider } from './src/context/AppContext';

const App = () => {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
        <Toast />
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
