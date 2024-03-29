import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Channel } from '../types/Channel'
import { RootState } from '../store'
import { addMemberships } from './membershipSlice'

export interface ChannelState {
  channels: Record<number, Channel>
  channelId: number | null,
}

const initialState: ChannelState = {
  channels: {},
  channelId: null,
}

export const channelSlice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    addChannels: (state, action: PayloadAction<Channel[]>) => {
      action.payload.forEach((channel) => {
        state.channels[channel.id] = {
          ...state.channels[channel.id],
          ...channel,
        }
      })
    },
    setFocusChannelId: (state, action: PayloadAction<number | null>) => {
      state.channelId = action.payload
    },
    toggleFocusChannelId: (state, action: PayloadAction<number>) => {
      if (state.channelId === action.payload) {
        state.channelId = null;
      } else {
        state.channelId = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder.addCase(addMemberships, (state, action) => {
      action.payload.forEach((membership) => {
        if (membership.channel?.id) {
          state.channels[membership.channel.id] = {
            ...state.channels[membership.channel.id],
            ...membership.channel
          };
        }
      })
    });
  },
})

// Action creators are generated for each case reducer function
export const { 
  addChannels,
  setFocusChannelId,
  toggleFocusChannelId,
 } = channelSlice.actions

export default channelSlice.reducer

export const selectChannelId = (state: RootState) => state.channel.channelId
export const selectChannels = (state: RootState) => state.channel.channels

export const selectChannel = createSelector(
  (state: RootState, id: number) => selectChannels(state),
  (state: RootState, id: number) => id,
  (channels, id) => channels[id]
)

export const selectFocusChannel = (state: RootState) => state.channel.channelId
  ? state.channel.channels[state.channel.channelId]
  : null;
