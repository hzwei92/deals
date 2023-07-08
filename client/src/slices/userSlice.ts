import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types/User'
import { RootState } from '../store'

export interface UserState {
  users: Record<number, User>;
  userId: number | null;
};

const initialState: UserState = {
  users: {},
  userId: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUsers: (state, action: PayloadAction<User[]>) => {
      action.payload.forEach((user) => {
        state.users[user.id] = user
      })
    },
    setAppUserId: (state, action: PayloadAction<number | null>) => {
      state.userId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  addUsers,
  setAppUserId,
 } = userSlice.actions

export default userSlice.reducer


export const selectUsers = (state: RootState) => state.user.users

export const selectUser = createSelector(
  (state: RootState, id: number) => selectUsers(state),
  (state: RootState, id: number) => id,
  (users, id) => users[id]
)

export const selectAppUser = (state: RootState) => state.user.userId 
  ? state.user.users[state.user.userId]
  : null;