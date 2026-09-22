# Persistent authentication: exact updated sections

The latest request includes the centered startup spinner. App.tsx already has the requested single AppProvider and NavigationContainer and is unchanged.

## src/context/AppContext.tsx

```diff
diff --git a/src/context/AppContext.tsx b/src/context/AppContext.tsx
index 3385f4c..7a98840 100644
--- a/src/context/AppContext.tsx
+++ b/src/context/AppContext.tsx
@@ -3,6 +3,7 @@ import React, {
   useContext,
   useState,
   useCallback,
+  useEffect,
   ReactNode,
 } from 'react';
 
@@ -28,6 +29,7 @@ import type {
   IPDAdmission,
 } from '../types';
 import Toast from 'react-native-toast-message';
+import AsyncStorage from '@react-native-async-storage/async-storage';
 // import * as mock from '../data/mockData';
 import * as mock from '../data/mockData';
 
@@ -35,7 +37,10 @@ interface AppContextType {
   user: User | null;
 
   login: (role: UserRole) => void;
-  logout: () => void;
+  isLoggedIn: boolean;
+  authLoading: boolean;
+  completeLogin: (token?: string) => Promise<void>;
+  logout: () => Promise<void>;
 
   currentPatientId: string;
   setCurrentPatientId: (id: string) => void;
@@ -187,6 +192,8 @@ export function AppProvider({
   children: ReactNode;
 }) {
   const [user, setUser] = useState<User | null>(null);
+  const [isLoggedIn, setIsLoggedIn] = useState(false);
+  const [authLoading, setAuthLoading] = useState(true);
 
   const [currentPatientId, setCurrentPatientId] =
     useState('PAT-001');
@@ -286,9 +293,59 @@ export function AppProvider({
     }
   }, []);
 
-  const logout = useCallback(() => {
+  useEffect(() => {
+    let active = true;
+    const restoreSession = async () => {
+      try {
+        const [status, token] = await Promise.all([
+          AsyncStorage.getItem('is_logged_in'),
+          AsyncStorage.getItem('access_token'),
+        ]);
+        // Successful tokenless OTP verification also creates a local session.
+        const valid = status === 'true' &&
+          (token === null || token.trim().length > 0);
+        if (active && valid) {
+          login('patient');
+          setIsLoggedIn(true);
+        }
+      } catch {
+        if (active) {
+          showToast('Unable to restore your session. Please sign in again.', 'error');
+        }
+      } finally {
+        if (active) {
+          setAuthLoading(false);
+        }
+      }
+    };
+    void restoreSession();
+    return () => {
+      active = false;
+    };
+  }, [login, showToast]);
+
+  const completeLogin = useCallback(async (token?: string) => {
+    if (token !== undefined && (typeof token !== 'string' || !token.trim())) {
+      throw new Error('Invalid access token received from the server');
+    }
+    // Write the login flag last so a failed token write cannot restore a session.
+    await AsyncStorage.removeItem('is_logged_in');
+    if (token !== undefined) {
+      await AsyncStorage.setItem('access_token', token.trim());
+    } else {
+      await AsyncStorage.removeItem('access_token');
+    }
+    await AsyncStorage.setItem('is_logged_in', 'true');
+    login('patient');
+    setIsLoggedIn(true);
+  }, [login]);
+
+  const logout = useCallback(async () => {
+    await AsyncStorage.removeItem('is_logged_in');
+    await AsyncStorage.removeItem('access_token');
     setUser(null);
     setCurrentPatientId('PAT-001');
+    setIsLoggedIn(false);
   }, []);
 
   // -------------------------
@@ -935,7 +992,7 @@ export function AppProvider({
                 ...bed,
                 status: 'occupied' as const,
                 patientId,
-                patientName: prev.find(
+                patientName: patients.find(
                   patient =>
                     patient.id === patientId
                 )?.name,
@@ -961,7 +1018,7 @@ export function AppProvider({
         ...prev,
       ]);
     },
-    []
+    [patients]
   );
 
   // -------------------------
@@ -1026,6 +1083,9 @@ export function AppProvider({
     <AppContext.Provider
       value={{
         user,
+        isLoggedIn,
+        authLoading,
+        completeLogin,
         login,
         logout,
 
```

## src/navigator/StackNavigator.tsx

```diff
diff --git a/src/navigator/StackNavigator.tsx b/src/navigator/StackNavigator.tsx
index f45b5fc..a7f2d7d 100644
--- a/src/navigator/StackNavigator.tsx
+++ b/src/navigator/StackNavigator.tsx
@@ -1,22 +1,41 @@
 import React from 'react';
+import { ActivityIndicator, StyleSheet, View } from 'react-native';
+import { useApp } from '../context/AppContext';
+import type { RootStackParamList } from '../types';
 import { createNativeStackNavigator } from '@react-navigation/native-stack';
 import Signup from '../screens/auth/signup/Signup';
 import LoginScreen from '../screens/auth/signIn/LoginScreen';
 import Otp from '../screens/auth/otp/Otp';
 import BottomTabNavigator from './BottomTabNavigator';
-// import Signup from '../screens/auth/signup/Signup';
 
-const Stack = createNativeStackNavigator();
+const Stack = createNativeStackNavigator<RootStackParamList>();
 
 const StackNavigator = () => {
+  const { authLoading, isLoggedIn } = useApp();
+  if (authLoading) {
+    return (
+      <View style={styles.loading}>
+        <ActivityIndicator size="large" />
+      </View>
+    );
+  }
   return (
     <Stack.Navigator screenOptions={{ headerShown: false }}>
-      <Stack.Screen name="LoginScreen" component={LoginScreen} />
-      <Stack.Screen name="Signup" component={Signup} />
-      <Stack.Screen name="Otp" component={Otp} />
-      <Stack.Screen name='PatientTabs' component={BottomTabNavigator}/>
+      {isLoggedIn ? (
+        <Stack.Screen name="PatientTabs" component={BottomTabNavigator} />
+      ) : (
+        <>
+          <Stack.Screen name="LoginScreen" component={LoginScreen} />
+          <Stack.Screen name="Signup" component={Signup} />
+          <Stack.Screen name="Otp" component={Otp} />
+        </>
+      )}
     </Stack.Navigator>
   );
 };
 
 export default StackNavigator;
+
+const styles = StyleSheet.create({
+  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
+});
```

## src/network/api.ts

```diff
diff --git a/src/network/api.ts b/src/network/api.ts
index 9ef9818..4bfb3a6 100644
--- a/src/network/api.ts
+++ b/src/network/api.ts
@@ -70,10 +70,17 @@ export interface PatientSigninData {
   password: string;
 }
 
+export interface PatientSigninResponse {
+  success: boolean;
+  message?: string;
+  accessToken?: string;
+  data?: { accessToken?: string };
+}
+
 export const patientSignin = async (
   data: PatientSigninData,
 ) => {
-  const response = await axios.post(
+  const response = await axios.post<PatientSigninResponse>(
     `${API_BASE_URL}/api/v1/patient/patientSignin`,
     data,
     {
@@ -98,7 +105,8 @@ export interface VerifyPatientPhoneData {
 export interface VerifyPatientPhoneResponse {
   success: boolean;
   message?: string;
-  data?: unknown;
+  isValid?: boolean;
+  data?: { phone?: string };
 }
 
 export const verifyPatientPhone = async (
```

## src/screens/auth/signIn/LoginScreen.tsx

```diff
diff --git a/src/screens/auth/signIn/LoginScreen.tsx b/src/screens/auth/signIn/LoginScreen.tsx
index f2940ca..bde6169 100644
--- a/src/screens/auth/signIn/LoginScreen.tsx
+++ b/src/screens/auth/signIn/LoginScreen.tsx
@@ -25,16 +25,13 @@ import {
   Shadows,
 } from '../../../constants/theme';
 
-import { Input, Chip } from '../../../components/input/Input';
+import { Input } from '../../../components/input/Input';
 
 import {
-  HeartPulse,
   Mail,
   Phone,
   Lock,
-  ChevronLeft,
 } from 'lucide-react-native';
-import { UserRole } from '../../../types';
 import { showToast } from '../../../utils/toast';
 import type { RootStackParamList } from '../../../types';
 import CustomButton from '../../../components/customButton/CustomButton';
@@ -44,7 +41,7 @@ import { scale } from '../../../utils/scale';
 import BackHeader from '../../../components/backHeader/BackHeader';
 import Divider from '../../../components/divider/Divider';
 import { patientSignin, verifyPatientPhone } from '../../../network/api';
-import AsyncStorage from '@react-native-async-storage/async-storage';
+import { useApp } from '../../../context/AppContext';
 type LoginScreenNavigationProp = NativeStackNavigationProp<
   RootStackParamList,
   'LoginScreen'
@@ -52,6 +49,7 @@ type LoginScreenNavigationProp = NativeStackNavigationProp<
 
 export default function LoginScreen() {
   const navigation = useNavigation<LoginScreenNavigationProp>();
+  const { completeLogin } = useApp();
 
   const insets = useSafeAreaInsets();
 
@@ -66,186 +64,6 @@ export default function LoginScreen() {
   const [loading, setLoading] = useState(false);
   const [otpLoading, setOtpLoading] = useState(false);
 
-  const navigateAfterLogin = () => {
-    // if (selectedRole === 'patient') {
-    //   navigation.replace('PatientTabs');
-    // } else if (selectedRole === 'doctor') {
-    //   navigation.replace('DoctorTabs');
-    // } else {
-    //   navigation.replace('AdminTabs');
-    // }
-  };
-
-  //   const dispatch = useDispatch();
-
-  //   const handleLogin = async () => {
-  //     console.log('In handleLogin');
-
-  //     if (mode === 'email' && !email) {
-  //       showToast('Please enter your email', 'error');
-  //       return;
-  //     }
-
-  //     if (mode === 'mobile' && !mobile) {
-  //       showToast('Please enter your mobile number', 'error');
-  //       return;
-  //     }
-
-  //     if (!password && !showOTP && mode === 'email') {
-  //       showToast('Please enter your password', 'error');
-  //       return;
-  //     }
-
-  //     // OTP verification
-  //     if (showOTP) {
-  //       if (otp.length !== 4) {
-  //         showToast('Please enter the 4-digit OTP', 'error');
-  //         return;
-  //       }
-
-  //       showToast('Login successful!', 'success');
-  //       navigateAfterLogin();
-  //       return;
-  //     }
-
-  //     // Email login
-  //     if (mode === 'email') {
-  //       console.log('In mode === email');
-
-  //       try {
-  //         // Same encryption as Angular web application
-  //         const encryptedEmail = CryptoJS.AES.encrypt(
-  //           email,
-  //           'email'
-  //         ).toString();
-
-  //         const encryptedPassword = CryptoJS.AES.encrypt(
-  //           password,
-  //           'password'
-  //         ).toString();
-
-  //         console.log('Encrypted Email:', encryptedEmail);
-  //         console.log('Encrypted Password:', encryptedPassword);
-
-  //         const response = await loginUser({
-  //           encryptedEmail,
-  //           encryptedPassword,
-  //         });
-
-  //         console.log('LOGIN RESPONSE:', response);
-
-  //         // showToast('Login successful!', 'success');
-
-  //         const accessToken = response?.accessToken;
-  //         if (accessToken) {
-  //           dispatch(setAccessToken(accessToken));
-
-  //           console.log('Access token saved in Redux');
-
-  //           // navigation.replace('PatientTabs');
-  //           navigateAfterLogin();
-  //         }
-
-  //       } catch (error: any) {
-  //         console.log('LOGIN ERROR:', error);
-
-  //         showToast(
-  //           error?.response?.data?.message || 'Login failed',
-  //           'error'
-  //         );
-  //       }
-  //     }
-  //   };
-
-  //   const handleLogin = () => {
-  //     console.log('handleLoginFunction');
-  //   };
-
-  // const handleLogin = async () => {
-  //   console.log("In handleLogin");
-
-  //   const normalizedEmail = email.trim().toLowerCase();
-
-  //   if (!normalizedEmail) {
-  //     showToast('Please enter your email address', 'error');
-  //     return;
-  //   }
-
-  //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
-
-  //   if (!emailPattern.test(normalizedEmail)) {
-  //     showToast('Please enter a valid email address', 'error');
-  //     return;
-  //   }
-
-  //   if (!password.trim()) {
-  //     showToast('Please enter your password', 'error');
-  //     return;
-  //   }
-
-  //   if (loading) {
-  //     return;
-  //   }
-
-  //   try {
-  //     setLoading(true);
-
-  //     const response = await patientSignin({
-  //       email: normalizedEmail,
-  //       password,
-  //     });
-
-  //     console.log("patientSignInResponse->",response);
-
-  //     if (!response.success) {
-  //       showToast(
-  //         response.message || 'Unable to sign in',
-  //         'error',
-  //       );
-  //       return;
-  //     }
-
-  //     const accessToken =
-  //       response.data?.accessToken || response.accessToken;
-
-  //     if (!accessToken) {
-  //       showToast(
-  //         'Access token was not received from the server',
-  //         'error',
-  //       );
-  //       return;
-  //     }
-
-  //     await AsyncStorage.setItem(
-  //       'access_token',
-  //       accessToken,
-  //     );
-
-  //     showToast(
-  //       response.message || 'Login successful',
-  //       'success',
-  //     );
-
-  //     navigation.replace('PatientTabs');
-  //   } catch (error: any) {
-  //   console.log(
-  //     'Patient sign-in error response:',
-  //     JSON.stringify(error.response?.data, null, 2),
-  //   );
-
-  //   console.log('Status code:', error.response?.status);
-
-  //   const message =
-  //     error.response?.data?.message ||
-  //     error.response?.data?.error ||
-  //     'Invalid email or password';
-
-  //   showToast(message, 'error');
-  // } finally {
-  //     setLoading(false);
-  //   }
-  // };
-
   const handleLogin = async () => {
     const normalizedEmail = email.trim().toLowerCase();
     const normalizedPassword = password.trim();
@@ -279,8 +97,6 @@ export default function LoginScreen() {
         password: normalizedPassword,
       });
 
-      console.log('Patient sign-in response:', response);
-
       if (!response?.success) {
         showToast(response?.message || 'Unable to sign in', 'error');
         return;
@@ -288,32 +104,15 @@ export default function LoginScreen() {
 
       const accessToken = response?.data?.accessToken || response?.accessToken;
 
-      if (!accessToken) {
+      if (typeof accessToken !== 'string' || !accessToken.trim()) {
         showToast('Access token was not received from the server', 'error');
         return;
       }
 
-      // Save only the access token
-      await AsyncStorage.setItem('access_token', accessToken);
-
-      // Verify that the access token was saved
-      const savedAccessToken = await AsyncStorage.getItem('access_token');
-
-      console.log('savedAccessToken->', savedAccessToken);
-
-      if (!savedAccessToken) {
-        showToast('Access token could not be saved', 'error');
-        return;
-      }
-
-      console.log(
-        'Access token saved successfully:',
-        Boolean(savedAccessToken),
-      );
+      await completeLogin(accessToken);
 
       showToast(response?.message || 'Login successful', 'success');
 
-      navigation.replace('PatientTabs');
     } catch (error: any) {
       console.log(
         'Patient sign-in error:',
@@ -335,6 +134,7 @@ export default function LoginScreen() {
   };
 
 const handleSendOtp = async () => {
+  if (otpLoading) { return; }
   const phone = mobile.trim();
 
   if (!/^\d{10}$/.test(phone)) {
@@ -491,8 +291,8 @@ const handleSendOtp = async () => {
 
         {mode === 'mobile' && !showOTP && (
           <CustomButton
-            disable={false}
-            title="Send OTP"
+            disable={otpLoading}
+            title={otpLoading ? 'Sending...' : 'Send OTP'}
             topHeight={22}
             bgColor={ColorConstants.BTNCOLOR}
             fontsize={14}
```

## src/screens/auth/otp/Otp.tsx

```diff
diff --git a/src/screens/auth/otp/Otp.tsx b/src/screens/auth/otp/Otp.tsx
index b291c8c..979ddeb 100644
--- a/src/screens/auth/otp/Otp.tsx
+++ b/src/screens/auth/otp/Otp.tsx
@@ -10,9 +10,8 @@ import {
   Keyboard,
   TouchableWithoutFeedback,
 } from 'react-native';
-// import { useNavigation } from '@react-navigation/native';
-import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
-import { NativeStackNavigationProp } from '@react-navigation/native-stack';
+import { RouteProp, useRoute } from '@react-navigation/native';
+import { useApp } from '../../../context/AppContext';
 
 import {
   Colors,
@@ -28,11 +27,10 @@ import { Fontconstants } from '../../../constants/fontConstants';
 import { showToast } from '../../../utils/toast';
 import { verifyPatientOtp } from '../../../network/api';
 
-type OTPNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Otp'>;
 type OTPRouteProp = RouteProp<RootStackParamList, 'Otp'>;
 
 const Otp = () => {
-  const navigation = useNavigation<OTPNavigationProp>();
+  const { completeLogin } = useApp();
   const route = useRoute<OTPRouteProp>();
 
   const { phone } = route.params;
@@ -42,7 +40,7 @@ const Otp = () => {
   const [keyboardVisible, setKeyboardVisible] = useState(false);
   const [verifyLoading, setVerifyLoading] = useState(false);
 
-  const inputRef = useRef<TextInput>(null);
+  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
   const isKeyboardVisibleRef = useRef(false);
 
   /**
@@ -94,16 +92,6 @@ const Otp = () => {
   /**
    * Verify OTP
    */
-  // const handleVerify = () => {
-  //   if (otp.length !== 6) {
-  //     console.log('Please enter a valid OTP');
-  //     return;
-  //   }
-
-  //   console.log('OTP:', otp);
-  //   navigation.replace('PatientTabs');
-  // };
-
   const handleVerify = async () => {
     if (otp.length !== 6) {
       showToast('Please enter a valid 6-digit OTP', 'error');
@@ -122,16 +110,16 @@ const Otp = () => {
         otp,
       });
 
-      console.log('Verify OTP response:', response);
-
       if (!response?.success || response?.isValid === false) {
         showToast(response?.message || 'Invalid OTP', 'error');
         return;
       }
 
+      const accessToken = response.data?.accessToken ?? response.accessToken;
+      await completeLogin(accessToken);
+
       showToast(response?.message || 'OTP verified successfully', 'success');
 
-      navigation.replace('PatientTabs');
     } catch (error: any) {
       console.log('Verify OTP error:', error?.response?.data || error?.message);
 
```

## src/screens/patient/profile/PatientProfileScreen.tsx

```diff
diff --git a/src/screens/patient/profile/PatientProfileScreen.tsx b/src/screens/patient/profile/PatientProfileScreen.tsx
index bcf6094..6575f90 100644
--- a/src/screens/patient/profile/PatientProfileScreen.tsx
+++ b/src/screens/patient/profile/PatientProfileScreen.tsx
@@ -1,4 +1,4 @@
-import React from 'react';
+import React, { useRef, useState } from 'react';
 import {
   View,
   Text,
@@ -46,9 +46,13 @@ export default function PatientProfileScreen() {
     currentPatientId,
     patients,
     logout,
+    showToast,
     medicationReminders,
   } = useApp();
 
+  const [logoutLoading, setLogoutLoading] = useState(false);
+  const logoutPending = useRef(false);
+
   const patient =
     patients.find(p => p.id === currentPatientId) || patients[0];
 
@@ -109,6 +113,13 @@ export default function PatientProfileScreen() {
   ];
 
   const handleLogout = () => {
+    if (logoutPending.current) { return; }
+    logoutPending.current = true;
+    setLogoutLoading(true);
+    const finishLogout = () => {
+      logoutPending.current = false;
+      setLogoutLoading(false);
+    };
     Alert.alert(
       'Logout',
       'Are you sure you want to logout?',
@@ -116,20 +127,23 @@ export default function PatientProfileScreen() {
         {
           text: 'Cancel',
           style: 'cancel',
+          onPress: finishLogout,
         },
         {
           text: 'Logout',
           style: 'destructive',
-          onPress: () => {
-            logout();
-
-            navigation.reset({
-              index: 0,
-              routes: [{ name: 'Welcome' }],
-            });
+          onPress: async () => {
+            try {
+              await logout();
+            } catch {
+              showToast('Unable to log out. Please try again.', 'error');
+            } finally {
+              finishLogout();
+            }
           },
         },
       ],
+      { cancelable: false },
     );
   };
 
@@ -264,6 +278,7 @@ export default function PatientProfileScreen() {
           <TouchableOpacity
             style={styles.logoutBtn}
             onPress={handleLogout}
+            disabled={logoutLoading}
             activeOpacity={0.7}
           >
             <LogOut
@@ -272,7 +287,7 @@ export default function PatientProfileScreen() {
             />
 
             <Text style={styles.logoutText}>
-              Logout
+              {logoutLoading ? 'Logging out...' : 'Logout'}
             </Text>
           </TouchableOpacity>
 
```

## __tests__/Auth.test.tsx

```tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from '../src/context/AppContext';
import StackNavigator from '../src/navigator/StackNavigator';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(),
}));
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ name }: { name: string }) => {
      const ReactModule = require('react');
      return ReactModule.createElement('view', { name });
    },
  }),
}));
jest.mock('../src/screens/auth/signIn/LoginScreen', () => () => null);
jest.mock('../src/screens/auth/signup/Signup', () => () => null);
jest.mock('../src/screens/auth/otp/Otp', () => () => null);
jest.mock('../src/navigator/BottomTabNavigator', () => () => null);

let app: ReturnType<typeof useApp>;
let root: ReactTestRenderer;
let saved: Map<string, string>;
function Probe() { app = useApp(); return <StackNavigator />; }
async function mount() {
  await act(async () => { root = create(<AppProvider><Probe /></AppProvider>); });
}
function routes() {
  return root.root.findAll(node => node.type === 'view')
    .map(node => node.props.name);
}
beforeEach(() => {
  jest.resetAllMocks();
  saved = new Map();
  (AsyncStorage.getItem as jest.Mock).mockImplementation(async key => saved.get(key) ?? null);
  (AsyncStorage.setItem as jest.Mock).mockImplementation(async (key, value) => { saved.set(key, value); });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation(async key => { saved.delete(key); });
});
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

test.each([
  [undefined, undefined, false], [undefined, 'token', false],
  ['false', 'token', false], ['invalid', 'token', false],
  ['true', '', false], ['true', 'token', true], ['true', undefined, true],
])('restores only valid saved state (%s, %s)', async (status, token, expected) => {
  if (status !== undefined) { saved.set('is_logged_in', status); }
  if (token !== undefined) { saved.set('access_token', token); }
  await mount();
  expect(app.authLoading).toBe(false);
  expect(app.isLoggedIn).toBe(expected);
  expect(routes()).toEqual(expected ? ['PatientTabs'] : ['LoginScreen', 'Signup', 'Otp']);
});

test.each(['real-token', undefined])('persists login and logout across remounts (%s)', async token => {
  await mount();
  saved.set('access_token', 'stale-token');
  await act(async () => app.completeLogin(token));
  expect(routes()).toEqual(['PatientTabs']);
  expect(saved.get('is_logged_in')).toBe('true');
  expect(saved.get('access_token')).toBe(token);
  await act(async () => root.unmount());
  await mount();
  expect(app.isLoggedIn).toBe(true);
  expect(routes()).toEqual(['PatientTabs']);
  await act(async () => app.logout());
  expect(app.user).toBeNull();
  expect(app.isLoggedIn).toBe(false);
  expect(saved.size).toBe(0);
  expect(routes()).toEqual(['LoginScreen', 'Signup', 'Otp']);
  await act(async () => root.unmount());
  await mount();
  expect(app.isLoggedIn).toBe(false);
});

test('startup shows only the spinner until storage resolves', async () => {
  let resolve!: (value: string | null) => void;
  (AsyncStorage.getItem as jest.Mock).mockReturnValueOnce(new Promise(r => { resolve = r; }));
  await mount();
  expect(app.authLoading).toBe(true);
  expect(routes()).toEqual([]);
  expect(root.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  await act(async () => { resolve(null); });
  expect(app.authLoading).toBe(false);
  expect(root.root.findAllByType(ActivityIndicator)).toHaveLength(0);
});

test('failed storage reads finish startup signed out', async () => {
  (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('read failed'));
  await mount();
  expect(app.authLoading).toBe(false);
  expect(app.isLoggedIn).toBe(false);
});

test('failed login writes never authenticate', async () => {
  await mount();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('write failed'));
  await act(async () => { await expect(app.completeLogin('token')).rejects.toThrow('write failed'); });
  expect(app.isLoggedIn).toBe(false);
  expect(saved.has('is_logged_in')).toBe(false);
});

test('failed logout rejects so the screen can show an error', async () => {
  await mount();
  await act(async () => app.completeLogin('token'));
  (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('remove failed'));
  await act(async () => { await expect(app.logout()).rejects.toThrow('remove failed'); });
  expect(app.isLoggedIn).toBe(true);
});

test.each(['', '   '])('rejects blank tokens (%s)', async token => {
  await mount();
  await act(async () => { await expect(app.completeLogin(token)).rejects.toThrow('Invalid access token'); });
  expect(app.isLoggedIn).toBe(false);
  expect(saved.size).toBe(0);
});
```

## __tests__/AuthScreens.test.tsx

```tsx
import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import LoginScreen from '../src/screens/auth/signIn/LoginScreen';
import Otp from '../src/screens/auth/otp/Otp';
import { TextInput } from 'react-native';
import { patientSignin, verifyPatientOtp } from '../src/network/api';
import { useApp } from '../src/context/AppContext';

// The first React Native render can include lazy module transforms on CI.
jest.setTimeout(15000);

jest.mock('../src/context/AppContext', () => ({ useApp: jest.fn() }));
jest.mock('../src/network/api', () => ({
  patientSignin: jest.fn(), verifyPatientOtp: jest.fn(), verifyPatientPhone: jest.fn(),
}));
jest.mock('../src/utils/toast', () => ({ showToast: jest.fn() }));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: { phone: '9999999999' } }),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('lucide-react-native', () => ({ Mail: () => null, Phone: () => null, Lock: () => null }));
jest.mock('../src/components/backHeader/BackHeader', () => () => null);
jest.mock('../src/components/divider/Divider', () => () => null);
jest.mock('../src/components/input/Input', () => ({
  Input: (props: object) => require('react').createElement('input', props),
}));
jest.mock('../src/components/customButton/CustomButton', () => (props: object) =>
  require('react').createElement('button', props));

let root: ReactTestRenderer;
const completeLogin = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  completeLogin.mockResolvedValue(undefined);
  (useApp as jest.Mock).mockReturnValue({ completeLogin });
});
afterEach(async () => { if (root) { await act(async () => root.unmount()); } });

async function submitEmail() {
  await act(async () => { root = create(<LoginScreen />); });
  await act(async () => {
    const inputs = root.root.findAllByType('input');
    inputs.find(node => node.props.label === 'Email Address')!.props.onChangeText('patient@example.com');
    inputs.find(node => node.props.label === 'Password')!.props.onChangeText('password');
  });
  await act(async () => {
    await root.root.findAllByType('button').find(node => node.props.title === 'Sign In')!.props.onPress();
  });
}

test.each([
  { success: true, accessToken: 'email-token' },
  { success: true, data: { accessToken: 'email-token' } },
])('email success completes the session with a real token (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(completeLogin).toHaveBeenCalledWith('email-token');
});

test.each([
  { success: false }, { success: true },
  { success: true, accessToken: '   ' },
])('invalid email response stays signed out (%j)', async response => {
  (patientSignin as jest.Mock).mockResolvedValue(response);
  await submitEmail();
  expect(completeLogin).not.toHaveBeenCalled();
});

async function submitOtp() {
  await act(async () => { root = create(<Otp />); });
  await act(async () => { root.root.findByType(TextInput).props.onChangeText('123456'); });
  await act(async () => {
    await root.root.findAllByType('button').find(node => node.props.title === 'Verify')!.props.onPress();
  });
}

test.each([
  [{ success: true, accessToken: 'otp-token' }, 'otp-token'],
  [{ success: true, data: { accessToken: 'otp-token' } }, 'otp-token'],
  [{ success: true, isValid: true }, undefined],
])('verified OTP completes the session (%j)', async (response, token) => {
  (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
  await submitOtp();
  expect(completeLogin).toHaveBeenCalledWith(token);
});

test.each([{ success: false }, { success: true, isValid: false }])(
  'invalid OTP stays signed out (%j)', async response => {
    (verifyPatientOtp as jest.Mock).mockResolvedValue(response);
    await submitOtp();
    expect(completeLogin).not.toHaveBeenCalled();
  },
);
```

