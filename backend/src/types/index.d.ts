export {}

declare global {
   interface SpotifyProfileImage {
      width?: number
      height?: number
      url: string
   }

   interface SpotifyMe {
      name: string
      image?: SpotifyProfileImage
   }

   interface SpotifyTrackImage extends SpotifyProfileImage {}

   interface SpotifyPlayingTrack {
      name: string
      artist: string
      album: string
      albumImage?: SpotifyTrackImage
   }
}