import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Membership } from '../types/Membership'
import { RootState } from '../store'

export interface MembershipState {
  memberships: Record<number, Membership>;
}

const initialState: MembershipState = {
  memberships: {},
}

export const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    addMemberships: (state, action: PayloadAction<Membership[]>) => {
      action.payload.forEach((membership) => {
        state.memberships[membership.id] = {
          ...state.memberships[membership.id],
          ...membership,
        };
      })
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  addMemberships,
 } = membershipSlice.actions

export default membershipSlice.reducer

export const selectMemberships = (state: RootState) => state.membership.memberships;

export const selectMembership = createSelector(
  (state: RootState, id: number) => selectMemberships(state),
  (state: RootState, id: number) => id,
  (memberships, id) => memberships[id]
);

export const selectMembershipsByUserId = createSelector(
  (state: RootState, userId: number) => selectMemberships(state),
  (state: RootState, userId: number) => userId,
  (memberships, userId) => Object.values(memberships).filter((membership) => membership.userId === userId)
);

export const selectMembershipsByChannelId = createSelector(
  (state: RootState, channelId: number) => selectMemberships(state),
  (state: RootState, channelId: number) => channelId,
  (memberships, channelId) => Object.values(memberships).filter((membership) => membership.channelId === channelId)
);

export const selectMembershipByChannelIdAndUserId = createSelector(
  (state: RootState, channelId: number, userId: number) => selectMemberships(state),
  (state: RootState, channelId: number, userId: number) => channelId,
  (state: RootState, channelId: number, userId: number) => userId,
  (memberships, channelId, userId) => Object.values(memberships).find((membership) => membership.channelId === channelId && membership.userId === userId)
);