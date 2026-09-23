import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import doctorsReducer from './doctorsSlice';

export const createAppStore = () =>
  configureStore({ reducer: { auth: authReducer, doctors: doctorsReducer } });
export const store = createAppStore();
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
