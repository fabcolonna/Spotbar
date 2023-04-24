export {}

declare global {
  interface Window {
    spotbar: {
      isVisible: () => Promise<boolean>
      setCredentials: (creds: import('./spotify').SpotifyCredentials) => void
      unsetCredentials: () => void
      quit: () => void
    }

    spotify: {
      getMe: () => Promise<import('./spotify').SpotifyMe>
      fetchPlaybackInfo: () => Promise<import('./spotify').SpotifyPlaybackInfo | undefined>
      togglePlayback: (value: 'play' | 'pause') => Promise<void>
      skipTrack: (which: 'previous' | 'next') => Promise<void>
      isTrackSaved: (id: string) => Promise<boolean>
      toggleSaveTrack: (id: string) => Promise<'added' | 'removed'>
    }
  }
}
