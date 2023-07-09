import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Channel } from '../types/Channel'
import { RootState } from '../store'

export interface ChannelState {
  channels: Record<number, Channel>
}

const initialState: ChannelState = {
  channels: {},
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
  },
})

// Action creators are generated for each case reducer function
export const { 
  addChannels,
 } = channelSlice.actions

export default channelSlice.reducer

export const selectChannels = (state: RootState) => state.channel.channels

export const selectChannel = createSelector(
  (state: RootState, id: number) => selectChannels(state),
  (state: RootState, id: number) => id,
  (channels, id) => channels[id]
)