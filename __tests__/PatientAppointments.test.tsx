import React from 'react';
import {act, create, ReactTestRenderer} from 'react-test-renderer';
import PatientAppointmentsScreen from '../src/screens/patient/appointments/PatientAppointmentsScreen';
import {getMyAppointments} from '../src/network/api';

let mockPatientId = '1';
jest.mock('../src/context/AppContext', () => ({
  useApp: () => ({currentPatientId: mockPatientId}),
}));
jest.mock('../src/network/api', () => ({getMyAppointments: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
  useFocusEffect: (callback: Function) => require('react').useEffect(callback, [callback]),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 0}),
}));
jest.mock('lucide-react-native', () => new Proxy({}, {get: () => () => null}));
jest.mock('../src/components/ui/DataDisplay', () => ({AppointmentCard: () => null}));
jest.mock('../src/components/ui/Card', () => ({EmptyState: () => null}));

test('reloads appointments for the selected patient and cancels the previous request', async () => {
  jest.mocked(getMyAppointments).mockResolvedValue([]);
  let root!: ReactTestRenderer;
  try {
    await act(async () => { root = create(<PatientAppointmentsScreen />); });
    expect(getMyAppointments).toHaveBeenLastCalledWith('1', expect.any(AbortSignal));
    const firstSignal = jest.mocked(getMyAppointments).mock.calls[0][1]!;

    mockPatientId = '2';
    await act(async () => { root.update(<PatientAppointmentsScreen />); });
    expect(firstSignal.aborted).toBe(true);
    expect(getMyAppointments).toHaveBeenLastCalledWith('2', expect.any(AbortSignal));

    mockPatientId = '1';
    await act(async () => { root.update(<PatientAppointmentsScreen />); });
    expect(getMyAppointments).toHaveBeenLastCalledWith('1', expect.any(AbortSignal));
  } finally {
    if (root) { await act(async () => root.unmount()); }
    mockPatientId = '1';
  }
});
