import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {getPatientVitals, type PatientVitals} from '../network/api';
import {useAppSelector} from '../store/hooks';
import {selectAccessToken} from '../store/selectors';
import {getErrorMessage} from '../utils/apiError';

export function usePatientVitals(patientId: string) {
  const accessToken = useAppSelector(selectAccessToken);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{
    patientId: string; token: string | null; attempt: number; vital: PatientVitals | null;
    loading: boolean; error: string | null;
  }>({patientId: '', token: null, attempt: 0, vital: null, loading: false, error: null});

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setState({patientId, token: accessToken, attempt, vital: null,
      loading: !!patientId && !!accessToken, error: null});
    if (patientId && accessToken) {
      getPatientVitals(patientId, controller.signal).then(vital => {
        if (!controller.signal.aborted) {
          setState({patientId, token: accessToken, attempt, vital, loading: false, error: null});
        }
      }).catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({patientId, token: accessToken, attempt, vital: null, loading: false,
            error: getErrorMessage(error, 'Unable to load patient vitals')});
        }
      });
    }
    return () => controller.abort();
  }, [patientId, accessToken, attempt]));

  const matches = state.patientId === patientId && state.token === accessToken && state.attempt === attempt;
  return {
    vital: matches ? state.vital : null,
    loading: matches ? state.loading : !!patientId && !!accessToken,
    error: matches ? state.error : null,
    retry: () => setAttempt(value => value + 1),
  };
}
