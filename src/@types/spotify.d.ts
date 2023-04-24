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
  name: string
  type: string
  volume: number | null
}

export type SpotifyTrack = {
  id: string
  title: string
  artists: string
  album: string
  albumArt?: SpotifyImage
  progressMs: number | null
  durationMs: number
}

export type SpotifyPlaybackInfo = {
  device: SpotifyDevice
  track: SpotifyTrack
  playing: boolean
}
