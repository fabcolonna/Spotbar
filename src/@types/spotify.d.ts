export type SpotifyCredentials = {
  clientId: string
  clientSecret: string
}

export type SpotifyMe = {
  name: string
  image?: SpotifyImage
}

export type SpotifyImage = {
  width?: number
  height?: number
  url: string
}

export type SpotifyDevice = {
  id: string | null
  name: string
  type: string
  volume: number | null
  isActive: boolean
}

export type SpotifyTrack = {
  id: string
  title: string
  artists: string
  album: string
  albumArt?: SpotifyImage
  progressMs: number | null
  progressPercent: number | null
  progressMMSS: string | null
  durationMs: number
  durationMMSS: string
}

export type SpotifyPlaybackInfo = {
  device: SpotifyDevice
  track: SpotifyTrack
  isPlaying: boolean
}
