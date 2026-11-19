import { createSlice } from '@reduxjs/toolkit';
import type { ParseKeys } from 'i18next';

interface AlertState {
  /** A translation key from src/i18n/locales/en.json; '' when no alert is shown. */
  text: ParseKeys | '';
  mode: 'success' | 'error' | 'info' | 'warning';
}

const initialState: AlertState = {
  text: '',
  mode: 'success',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlertAC: (state, action: { payload: { text: ParseKeys, mode: 'success' | 'error' | 'info' | 'warning' } }) => {
      state.text = action.payload.text;
      state.mode = action.payload.mode;
    },
    removeAlertAC: (state) => {
      state.text = '';
    },
  },
});

export const { setAlertAC, removeAlertAC } = alertSlice.actions;
export default alertSlice.reducer;
