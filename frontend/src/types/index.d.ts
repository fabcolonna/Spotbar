export {}

declare global {
   interface Window {
      spotify: {
         getMe: () => Promise<Spotify.Me>,
         fetchPlaybackInfo: () => Promise<Spotify.PlaybackInfo | undefined>
      }
   }
}
