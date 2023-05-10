export {}

declare global {
  interface Window {
    spotbar: {
      isVisible: () => Promise<boolean>
      quit: () => Promise<void>
      resize: (how: 'big' | 'compact') => Promise<'big' | 'compact'>
      didFindCredentials: () => Promise<boolean>
      getOs: () => Promise<string>
      loadCredentials: (creds: import('./spotify').SpotifyCredentials) => Promise<boolean>
      unloadCredentials: () => void
    }

    spotify: {
      getMe: () => Promise<import('./spotify').SpotifyMe>
      fetchPlaybackInfo: () => Promise<import('./spotify').SpotifyPlaybackInfo | undefined>
      togglePlayback: (value: 'play' | 'pause') => Promise<void>
      skipTrack: (which: 'previous' | 'next') => Promise<void>
      isTrackSaved: (id: string) => Promise<boolean>
      toggleSaveTrack: (id: string) => Promise<'added' | 'removed'>
      getSpotifyConnectDevices: () => Promise<import('./spotify').SpotifyDevice[]>
      setVolume: (volume: number, device: import('./spotify').SpotifyDevice) => Promise<void>
      changeStreamingDevice: (device: import('./spotify').SpotifyDevice, startPlaying: boolean) => Promise<void>
      scrubTo: (ms: number) => Promise<void>
      getAudioData: () => Promise<import('./spotify').SpotifyAudioData | undefined>
    }
  }
}
