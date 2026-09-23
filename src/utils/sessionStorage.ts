import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseSession } from '../types/auth';
import type { AuthSession } from '../types/auth';

export const SESSION_KEY = 'patient_session';

async function removeLegacyKeys(): Promise<void> {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('is_logged_in');
}

export async function readSession(): Promise<AuthSession | null> {
  const stored = await AsyncStorage.getItem(SESSION_KEY);
  if (!stored) {
    // Token-only legacy sessions cannot restore the patient's identity.
    await removeLegacyKeys();
    return null;
  }
  try {
    const value: unknown = JSON.parse(stored);
    return parseSession(value);
  } catch {
    await clearSession();
    throw new Error('Unable to restore your session. Please sign in again.');
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await removeLegacyKeys();
  // Persist one snapshot so the token, profile, and entity cannot become mismatched.
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify(parseSession(session)),
  );
}

export async function clearSession(): Promise<void> {
  await removeLegacyKeys();
  await AsyncStorage.removeItem(SESSION_KEY);
}
