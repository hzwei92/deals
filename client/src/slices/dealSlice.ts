import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Deal } from '../types/Deal'
import { RootState } from '../store'

export interface DealState {
  dealId: number | null;
  deals: Record<number, Deal>
}

const initialState: DealState = {
  dealId: null,
  deals: {},
}

export const dealSlice = createSlice({
  name: 'deal',
  initialState,
  reducers: {
    addDeals: (state, action: PayloadAction<Deal[]>) => {
      action.payload.forEach((deal) => {
        state.deals[deal.id] = deal
      })
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  addDeals,
 } = dealSlice.actions

export default dealSlice.reducer


export const selectDeals = (state: RootState) => state.deal.deals
export const selectDeal = createSelector(
  (state: RootState, id: number) => selectDeals(state),
  (state: RootState, id: number) => id,
  (deals, id) => deals[id]
)