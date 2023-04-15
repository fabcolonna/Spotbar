import { extractColorsFromSrc } from 'extract-colors'

export namespace Utils {
   export namespace Internet {
      export const checkConnection = (timeout: number, onAbsent: () => void, onOk?: () => void) => {
         const controller = new AbortController()
         const timer = setTimeout(() => controller.abort(), timeout * 1000)

         fetch('https://1.1.1.1', { mode: 'no-cors', method: 'HEAD', cache: 'no-cache' })
            .then(() => {
               clearTimeout(timer)
               onOk && onOk()
            })
            .catch(onAbsent)
      }
   }

   export namespace ImageColors {
      export const extractHexSwatch = (image: Spotify.Image): Promise<string[]> => {
         return new Promise(resolve => {
            extractColorsFromSrc(image.url, { crossOrigin: 'anonymous' })
               .then(data => resolve(data.filter(col => col.lightness < 0.4).map(col => col.hex)))
               .catch(() => resolve([]))
         })
      }

      export const getRandom = (hexSwatch: string[]) => hexSwatch[Math.floor(Math.random() * hexSwatch.length)]
   }
}
