import { extractColorsFromSrc } from 'extract-colors'
import { SpotifyImage } from '../../../@types/spotify'
import axios from 'axios'

export const checkNetwork = (timeout: number, onNo: (message: string) => void, onYes?: () => void) => {
  axios
    .head('https://dog.ceo/api/breeds/image/random', { timeout: timeout * 1000 })
    .then(() => onYes && onYes())
    .catch(e => onNo(`Check your network: ${e}`))
}

export const extractHexSwatch = (image: SpotifyImage): Promise<string[]> => {
  return new Promise(resolve => {
    extractColorsFromSrc(image.url, { crossOrigin: 'anonymous' })
      .then(data => resolve(data.filter(col => col.lightness < 0.5).map(col => col.hex)))
      .catch(() => resolve([]))
  })
}

export const getRandomColor = (hexSwatch: string[]) => hexSwatch[Math.floor(Math.random() * hexSwatch.length)]

export * as Utilities from './utils'
