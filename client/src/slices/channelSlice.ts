import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Channel } from '../types/Channel'
import { RootState } from '../store'

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
        state.channels[channel.id] = channel
      })
    },
    activateChannel: (state, action: PayloadAction<number | null>) => {
      state.channelId = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  addChannels,
  activateChannel,
 } = channelSlice.actions

export default channelSlice.reducer

export const selectChannelId = (state: RootState) => state.channel.channelId
export const selectChannels = (state: RootState) => state.channel.channels

export const selectChannel = createSelector(
  (state: RootState, id: number) => selectChannels(state),
  (state: RootState, id: number) => id,
  (channels, id) => channels[id]
)

export const selectActiveChannel = (state: RootState) => state.channel.channelId
  ? state.channel.channels[state.channel.channelId]
  : null;
