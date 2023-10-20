import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import channelReducer from './slices/channelSlice';
import dealReducer from './slices/dealSlice';
import userReducer from './slices/userSlice';
import membershipReducer from './slices/membershipSlice';
import postReducer from './slices/postSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    channel: channelReducer,
    deal: dealReducer,
    membership: membershipReducer,
    post: postReducer,
    user: userReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector