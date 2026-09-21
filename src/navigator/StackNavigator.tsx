import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Signup from '../screens/auth/signup/Signup';
import LoginScreen from '../screens/auth/signIn/LoginScreen';
// import Signup from '../screens/auth/signup/Signup';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator  screenOptions={{ headerShown: false }}>
                        <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
            />
            <Stack.Screen
                name="Signup"
                component={Signup}
            />
        </Stack.Navigator>
    )
}

export default StackNavigator
