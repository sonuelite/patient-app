import React from 'react';
import {Provider} from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import StackNavigator from './src/navigator/StackNavigator';
import Toast from 'react-native-toast-message';
import { AppProvider } from './src/context/AppContext';
import {store} from './src/store';
import {useAppSelector} from './src/store/hooks';
import {selectPatientId} from './src/store/selectors';

const AppContent = () => {
  const patientId = useAppSelector(selectPatientId);
  return (
    <AppProvider key={patientId ?? 'signed-out'}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
      <Toast />
    </AppProvider>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
