import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit'
import { SpotifyPlaybackInfo } from 'src/@types/spotify'
import { RootState } from './pb-store'

const NOTHING_PLAYING: SpotifyPlaybackInfo = {
  device: { name: '', type: '', volume: null, isActive: false, id: null },
  track: {
    id: '',
    title: 'Nothing is playing!',
    artists: 'Open Spotify somewhere 🎧',
    album: '',
    progressMs: null,
    durationMs: 0,
    progressPercent: null,
    progressMMSS: null,
    durationMMSS: ''
  },
  isPlaying: false
}

const playbackInfoSlice = createSlice({
  name: 'playbackInfo',
  initialState: NOTHING_PLAYING,
  reducers: {
    unset: _ => {
      return NOTHING_PLAYING
    },
    set: (_, action: PayloadAction<SpotifyPlaybackInfo>) => {
      return { ...action.payload }
    }
  }
})

// Used to check if state is unsetted, i.e. set to NOTHING_PLAYING
export const isUnsetted = createSelector(
  (state: RootState) => state.playback,
  state => state === NOTHING_PLAYING
)

export const { unset, set } = playbackInfoSlice.actions
export default playbackInfoSlice.reducer
