import { configureStore } from '@reduxjs/toolkit'
import playbackInfoReducer from '@renderer/playback-info-state/pb-state'

export const playbackInfoStore = configureStore({
  reducer: {
    playback: playbackInfoReducer
  }
})

export type RootState = ReturnType<typeof playbackInfoStore.getState>
export type AppDispatch = typeof playbackInfoStore.dispatch
