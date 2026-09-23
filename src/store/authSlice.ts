import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import type { AuthPatient, AuthSession } from '../types/auth';
import { parseSession } from '../types/auth';
import {
  clearSession,
  readSession,
  saveSession,
} from '../utils/sessionStorage';
import { getErrorMessage } from '../utils/apiError';

export interface AuthState {
  accessToken: string | null;
  patient: AuthPatient | null;
  selectedEntityId: string | null;
  isLoggedIn: boolean;
  hydrated: boolean;
  busy: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  patient: null,
  selectedEntityId: null,
  isLoggedIn: false,
  hydrated: false,
  busy: false,
  error: null,
};

const authThunk = createAsyncThunk.withTypes<{
  state: { auth: AuthState };
  rejectValue: string;
}>();

export const restoreAuth = authThunk<AuthSession | null, void>(
  'auth/restore',
  async (_, { rejectWithValue }) => {
    try {
      return await readSession();
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to restore your session'),
      );
    }
  },
  {
    condition: (_, { getState }) =>
      !getState().auth.hydrated && !getState().auth.busy,
  },
);

export const completeLogin = authThunk<AuthSession, AuthSession>(
  'auth/login',
  async (input, { rejectWithValue }) => {
    try {
      const session = parseSession(input);
      await saveSession(session);
      return session;
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to save your session'),
      );
    }
  },
  { condition: (_, { getState }) => !getState().auth.busy },
);

export const selectEntity = authThunk<AuthSession, string>(
  'auth/selectEntity',
  async (entityId, { getState, rejectWithValue }) => {
    try {
      const { accessToken, patient } = getState().auth;
      const session = parseSession({
        accessToken,
        patient,
        selectedEntityId: entityId,
      });
      await saveSession(session);
      return session;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Unable to select entity'));
    }
  },
  {
    condition: (_, { getState }) =>
      getState().auth.isLoggedIn && !getState().auth.busy,
  },
);

export const logout = authThunk<void, void>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await clearSession();
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Unable to log out. Please try again.'),
      );
    }
  },
  { condition: (_, { getState }) => !getState().auth.busy },
);

function applySession(state: AuthState, session: AuthSession | null) {
  state.accessToken = session?.accessToken ?? null;
  state.patient = session?.patient ?? null;
  state.selectedEntityId = session?.selectedEntityId ?? null;
  state.isLoggedIn = session !== null;
  state.hydrated = true;
  state.busy = false;
  state.error = null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(restoreAuth.fulfilled, (state, action) => {
        applySession(state, action.payload);
      })
      .addCase(completeLogin.fulfilled, (state, action) => {
        applySession(state, action.payload);
      })
      .addCase(selectEntity.fulfilled, (state, action) => {
        applySession(state, action.payload);
      })
      .addCase(logout.fulfilled, state => {
        applySession(state, null);
      })
      .addMatcher(
        isAnyOf(
          restoreAuth.pending,
          completeLogin.pending,
          selectEntity.pending,
          logout.pending,
        ),
        state => {
          state.busy = true;
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(
          restoreAuth.rejected,
          completeLogin.rejected,
          selectEntity.rejected,
          logout.rejected,
        ),
        (state, action) => {
          state.busy = false;
          state.hydrated = true;
          state.error =
            typeof action.payload === 'string'
              ? action.payload
              : 'Authentication failed';
        },
      );
  },
});

export default authSlice.reducer;
