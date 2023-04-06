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
}