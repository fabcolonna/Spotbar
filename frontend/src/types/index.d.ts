export {}

declare global {
   interface Image {
      width: number
      height: number
      url: string
   }
   interface Window {
      spotifyApi: {
         loginGetMe(): { name: string, image?: Image }?
      }
   }
}
