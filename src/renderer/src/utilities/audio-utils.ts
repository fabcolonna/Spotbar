import FFT from 'fft.js'
import { SpotifyAudioSegment } from 'src/@types/spotify'

// Always returns 1 element
export const getCurrentlyPlayingSegments = (nowMs: number, segments: SpotifyAudioSegment[]): SpotifyAudioSegment => {
  return segments.filter(seg => {
    const segStartMs = seg.start * 1000
    const segEndMs = (seg.start + seg.duration) * 1000
    return nowMs >= segStartMs && nowMs < segEndMs
  })[0]
}

export const interpolatePitches = (pitches: number[], desiredLength: number): number[] => {
  const output: number[] = []
  const step = (pitches.length - 1) / (desiredLength - 1)

  for (let i = 0; i < desiredLength; i++) {
    const idx = step * i
    const [floorIdx, ceilIdx] = [Math.floor(idx), Math.ceil(idx)]

    // Last element copied
    if (ceilIdx >= pitches.length) {
      output.push(pitches[pitches.length - 1])
      continue
    }

    const weight = idx - floorIdx
    const lowerVal = pitches[floorIdx]
    const upperVal = pitches[ceilIdx]

    const interpolated = lowerVal + (upperVal - lowerVal) * weight
    output.push(interpolated)
  }

  return output
}

export const evaluateFft = (pitches: number[]): number[] => {
  const fourier = new FFT(pitches.length)

  const output = fourier.createComplexArray()
  fourier.realTransform(output, pitches)

  return output
}

export * as AudioUtilities from './audio-utils'
