import SpotifyWebApi from 'spotify-web-api-node'
import { SpotifyDevice, SpotifyMe, SpotifyPlaybackInfo } from '../@types/spotify'
import Spotbar from './spotbar'
import SpotifyTokenManager from './spotify-token-mgr'
import moment from 'moment'

export default class SpotifyApiManager {
  private readonly api: SpotifyWebApi
  private readonly tokenManager: SpotifyTokenManager

  constructor(spotbar: Spotbar, clientId: string, clientSecret: string) {
    this.api = new SpotifyWebApi({ clientId: clientId, clientSecret: clientSecret })
    this.tokenManager = new SpotifyTokenManager(spotbar, this.api)
  }

  public getMe = async (): Promise<SpotifyMe> => {
    const [id, secret] = [this.api.getClientId(), this.api.getClientSecret()]
    if (!id || id.length === 0 || !secret || secret.length === 0) throw new Error('Missing Spotify credentials')

    await this.tokenManager.assign()

    const me = await this.api.getMe()
    if (!me.body) throw new Error('Could not retrieve your Spotify profile info: Bad response')

    const body = me.body
    if (body.product !== 'premium') throw new Error('Sorry, non-Premium accounts are not supported by Spotbar')

    return {
      name: body.display_name!, // Profiles must have a name :/
      image: !body.images || body.images.length === 0 ? undefined : body.images[0]
    }
  }

  public fetchPlaybackInfo = async (): Promise<SpotifyPlaybackInfo | undefined> => {
    if (this.tokenManager.valid() === undefined) throw new Error('Could not get playback info: Did you log in? :/')

    await this.tokenManager.refresh()
    const info = await this.api.getMyCurrentPlaybackState()
    if (!info.body) throw new Error('Could not get playback info: Bad response')

    const getFormattedTime = (ms: number): string => {
      const mom = moment.duration(ms, 'milliseconds')
      return `${String(mom.minutes()).padStart(2, '0')}:${String(mom.seconds()).padStart(2, '0')}`
    }

    const body = info.body
    return !body.item
      ? undefined
      : {
          device: {
            id: body.device.id,
            name: body.device.name,
            type: body.device.type,
            volume: body.device.volume_percent,
            isActive: body.device.is_active
          },
          track: {
            id: body.item.id,
            title: body.item.name,
            artists: body.item['artists'].map(obj => obj.name).join(', '),
            album: body.item['album'].name,
            albumArt: body.item['album'].images && body.item['album'].images[0],
            progressMs: body.progress_ms,
            progressPercent: body.progress_ms ? Math.ceil((body.progress_ms / body.item.duration_ms) * 100) : null,
            progressMMSS: body.progress_ms ? getFormattedTime(body.progress_ms) : null,
            durationMs: body.item.duration_ms,
            durationMMSS: getFormattedTime(body.item.duration_ms)
          },
          isPlaying: body.is_playing
        }
  }

  public togglePlayback = async (_: any, value: 'play' | 'pause'): Promise<void> => {
    await this.tokenManager.refresh()
    value === 'play' ? await this.api.play({}) : await this.api.pause({})
  }

  public skipTrack = async (_: any, which: 'previous' | 'next'): Promise<void> => {
    await this.tokenManager.refresh()
    which === 'previous' ? await this.api.skipToPrevious() : await this.api.skipToNext()
  }

  public isTrackSaved = async (_: any, id: string): Promise<boolean> => {
    await this.tokenManager.refresh()
    const res = await this.api.containsMySavedTracks([id])
    if (!res.body) throw new Error('Could not check if track: "' + id + '" is saved: Bad response')

    return res.body[0]
  }

  public toggleSaveTrack = async (_: any, id: string): Promise<'added' | 'removed' | undefined> => {
    await this.tokenManager.refresh()
    ;(await this.isTrackSaved(_, id))
      ? await this.api.removeFromMySavedTracks([id]).then(() => Promise.resolve('removed'))
      : await this.api.addToMySavedTracks([id]).then(() => Promise.resolve('added'))

    return undefined
  }

  public getSpotifyConnectDevices = async (): Promise<SpotifyDevice[]> => {
    await this.tokenManager.refresh()
    const res = await this.api.getMyDevices()
    if (!res.body) throw new Error('Could not get available Spotify Connect devices: Bad response')

    return res.body.devices.map(dev => {
      const s: SpotifyDevice = {
        id: dev.id,
        name: dev.name,
        volume: dev.volume_percent,
        type: dev.type,
        isActive: dev.is_active
      }

      return s
    })
  }

  public setVolume = async (_: any, volume: number, device: SpotifyDevice): Promise<void> => {
    await this.tokenManager.refresh()
    await this.api.setVolume(volume, device.id ? { device_id: device.id } : {})
  }

  public changeStreamingDevice = async (_: any, device: SpotifyDevice, startPlaying: boolean): Promise<void> => {
    await this.tokenManager.refresh()

    if (!device.id) return
    await this.api.transferMyPlayback([device.id])
    startPlaying && this.api.play({ device_id: device.id })
  }
}
