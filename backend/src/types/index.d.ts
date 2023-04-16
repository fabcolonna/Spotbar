export {}

declare global {
   namespace Spotify {
      interface Image {
         width?: number
         height?: number
         url: string
      }
      interface Me {
         name: string
         image?: Image
      }

      interface Device {
         name: string
         type: string
         volume: number | null
      }

      interface Track {
         id: string
         title: string
         artists: string
         album: string
         albumArt?: Image
         progressMs: number | null
         durationMs: number
      }

      interface PlaybackInfo {
         device: Device
         track: Track
         playing: boolean
      }
   }
}
