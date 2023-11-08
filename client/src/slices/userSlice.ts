import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { User } from '../types/User'
import { RootState } from '../store'
import { addMemberships } from './membershipSlice';
import { addChannels } from './channelSlice';

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
        state.users[user.id] = {
          ...state.users[user.id],
          ...user,
        };
      })
    },
    setAppUserId: (state, action: PayloadAction<number | null>) => {
      state.userId = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(addMemberships, (state, action) => {
      action.payload.forEach((membership) => {
        if (membership.user?.id) {
          state.users[membership.user.id] = {
            ...state.users[membership.user.id],
            ...membership.user,
          };
        }
      })
    }).addCase(addChannels, (state, action) => {
      action.payload.forEach((channel) => {
        (channel.memberships ?? []).forEach((membership) => {
          if (membership.user?.id) {
            state.users[membership.user.id] = {
              ...state.users[membership.user.id],
              ...membership.user,
            };
          }
        });
      });
    });
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