import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Post } from '../types/Post'
import { RootState } from '../store'

export interface PostState {
  posts: Record<number, Post>
}

const initialState: PostState = {
  posts: {},
}

export const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    addPosts: (state, action: PayloadAction<Post[]>) => {
      action.payload.forEach((post) => {
        state.posts[post.id] = {
          ...state.posts[post.id],
          ...post,
        }
      })
    },
  },
})

// Action creators are generated for each case reducer function
export const { 
  addPosts,
 } = postSlice.actions

export default postSlice.reducer


export const selectPosts = (state: RootState) => state.post.posts
export const selectPost = createSelector(
  (state: RootState, id: number) => selectPosts(state),
  (state: RootState, id: number) => id,
  (posts, id) => posts[id]
)


export const selectPostsByUserId = createSelector(
  (state: RootState, userId: number) => selectPosts(state),
  (state: RootState, userId: number) => userId,
  (posts, userId) => Object.values(posts).filter((post) => post.userId === userId)
);

export const selectPostsByChannelId = createSelector(
  (state: RootState, channelId: number) => selectPosts(state),
  (state: RootState, channelId: number) => channelId,
  (posts, channelId) => Object.values(posts).filter((post) => post.channelId === channelId)
);

export const selectPostByChannelIdAndUserId = createSelector(
  (state: RootState, channelId: number, userId: number) => selectPosts(state),
  (state: RootState, channelId: number, userId: number) => channelId,
  (state: RootState, channelId: number, userId: number) => userId,
  (posts, channelId, userId) => Object.values(posts).find((post) => post.channelId === channelId && post.userId === userId)
);