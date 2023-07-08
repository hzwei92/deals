
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface AuthState {
  interval: ReturnType<typeof setInterval> | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  interval: null,
  isInitialized: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRefreshInterval: (state, action: PayloadAction<ReturnType<typeof setInterval> | null>) => {
      state.interval = action.payload
    },
    setIsInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  setRefreshInterval,
  setIsInitialized,
} = authSlice.actions

export default authSlice.reducer

export const selectInterval = (state: RootState) => state.auth.interval;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;