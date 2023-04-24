import { extractColorsFromSrc } from 'extract-colors'
import { SpotifyImage } from '../../../@types/spotify'
export * as Utilities from './utils'

export const checkConnection = (timeout: number, onAbsent: () => void, onOk?: () => void) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout * 1000)
  fetch('https://1.1.1.1', { mode: 'no-cors', method: 'HEAD', cache: 'no-cache' })
    .catch(onAbsent)
    .then(() => {
      clearTimeout(timer)
      onOk && onOk()
    })
}

export const extractHexSwatch = (image: SpotifyImage): Promise<string[]> => {
  return new Promise(resolve => {
    extractColorsFromSrc(image.url, { crossOrigin: 'anonymous' })
      .then(data => resolve(data.filter(col => col.lightness < 0.4).map(col => col.hex)))
      .catch(() => resolve([]))
  })
}

export const getRandomColor = (hexSwatch: string[]) => hexSwatch[Math.floor(Math.random() * hexSwatch.length)]
