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

   interface SpotifyDevice {
      name: string
      type: string 
      volume: Number | null
   }

   interface SpotifyTrack {
      title: string 
      artists: string
      album: string
      albumImage?: SpotifyTrackImage
      progressMilli: Number | null
      durationMilli: Number
   }

   interface SpotifyPlaybackStatus {
      device: SpotifyDevice
      track: SpotifyTrack
      isPlaying: boolean
   }
}
