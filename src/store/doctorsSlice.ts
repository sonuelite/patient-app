import {createSlice, isAnyOf} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {Doctor} from '../types';
import {completeLogin, logout, restoreAuth, selectEntity} from './authSlice';

interface DoctorsState {
  items: Doctor[];
}

const initialState: DoctorsState = {items: []};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctors(state, action: PayloadAction<Doctor[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addMatcher(
      isAnyOf(
        completeLogin.fulfilled,
        logout.fulfilled,
        restoreAuth.fulfilled,
        selectEntity.fulfilled,
      ),
      () => initialState,
    );
  },
});

export const {setDoctors} = doctorsSlice.actions;
export default doctorsSlice.reducer;
