import { SpotifyMe, SpotifyPlayingTrack } from '../../backend/src/types/index'

export {}

declare global {
   interface Window {
      spotifyApi: {
         loginGetMe: () => Promise<SpotifyMe>,
         getPlayingTrack: () => Promise<SpotifyPlayingTrack> | undefined
      }
   }
}
