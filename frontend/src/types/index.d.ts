export {}

declare global {
   interface Window {
      spotbar: {
         isVisible: () => Promise<boolean>
      }

      spotify: {
         getMe: () => Promise<Spotify.Me>,
         fetchPlaybackInfo: () => Promise<Spotify.PlaybackInfo | undefined>,
         togglePlayback: (value: 'play' | 'pause') => Promise<void>,
         skipTrack: (which: 'previous' | 'next') => Promise<void>,
         isTrackSaved: (id: string) => Promise<boolean>,
         toggleSaveTrack: (id: string) => Promise<'added' | 'removed'>
      }
   }
}
