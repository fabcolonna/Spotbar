import { SpotifyMe, SpotifyPlaybackStatus } from '../../backend/src/types/index'

export {}

declare global {
   interface Window {
      spotifyApi: {
         loginGetMe: () => Promise<SpotifyMe>,
         getPlaybackStatus: () => Promise<SpotifyPlaybackStatus | undefined>
      }
   }
}
