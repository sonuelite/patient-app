import type { RootState } from './index';

export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectPatient = (state: RootState) => state.auth.patient;
export const selectPatientId = (state: RootState) =>
  state.auth.patient?.patient_id ?? null;
export const selectEntityId = (state: RootState) => state.auth.selectedEntityId;
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthLoading = (state: RootState) => !state.auth.hydrated;
export const selectAuthBusy = (state: RootState) => state.auth.busy;
