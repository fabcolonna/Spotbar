import SpotifyWebApi from 'spotify-web-api-node'
import SpotifyTokenManager from './spotify-token-mgr'
import Spotbar from './spotbar'
import { SpotifyMe, SpotifyPlaybackInfo } from '../@types/spotify'

export default class SpotifyApiManager {
  private readonly api: SpotifyWebApi
  private readonly tokenManager: SpotifyTokenManager

  constructor(spotbar: Spotbar, clientId: string, clientSecret: string) {
    this.api = new SpotifyWebApi({ clientId: clientId, clientSecret: clientSecret })
    this.tokenManager = new SpotifyTokenManager(spotbar, this.api)
  }

  public GetMe = async (): Promise<SpotifyMe> => {
    const [id, secret] = [this.api.getClientId(), this.api.getClientSecret()]
    if (!id || id.length === 0 || !secret || secret.length === 0) throw new Error('Missing Spotify credentials')

    await this.tokenManager.Assign()

    const me = await this.api.getMe()
    if (!me.body) throw new Error('Could not retrieve your Spotify profile info: Bad response')

    const body = me.body
    if (body.product !== 'premium') throw new Error('Sorry, non-Premium accounts are not supported by Spotbar')

    return {
      name: body.display_name!, // Profiles must have a name :/
      image: !body.images || body.images.length === 0 ? undefined : body.images[0]
    }
  }

  public FetchPlaybackInfo = async (): Promise<SpotifyPlaybackInfo | undefined> => {
    if (this.tokenManager.Valid() === undefined) throw new Error('Could not get playback info: Did you log in? :/')

    await this.tokenManager.Refresh()
    const info = await this.api.getMyCurrentPlaybackState()
    if (!info.body) throw new Error('Could not get playback info: Bad response')

    const body = info.body
    return !body.item
      ? undefined
      : {
          device: {
            name: body.device.name,
            type: body.device.type,
            volume: body.device.volume_percent
          },
          track: {
            id: body.item.id,
            title: body.item.name,
            artists: body.item['artists'].map(obj => obj.name).join(', '),
            album: body.item['album'].name,
            albumArt: body.item['album'].images && body.item['album'].images[0],
            progressMs: body.progress_ms,
            durationMs: body.item.duration_ms
          },
          playing: body.is_playing
        }
  }

  public TogglePlayback = async (_: any, value: 'play' | 'pause'): Promise<void> => {
    await this.tokenManager.Refresh()
    value === 'play' ? await this.api.play({}) : await this.api.pause({})
  }

  public SkipTrack = async (_: any, which: 'previous' | 'next'): Promise<void> => {
    await this.tokenManager.Refresh()
    which === 'previous' ? await this.api.skipToPrevious() : await this.api.skipToNext()
  }

  public IsTrackSaved = async (_: any, id: string): Promise<boolean> => {
    await this.tokenManager.Refresh()
    const res = await this.api.containsMySavedTracks([id])
    if (!res.body) throw new Error('Could not check if track: "' + id + '" is saved: Bad response')

    return res.body[0]
  }

  public ToggleSaveTrack = async (_: any, id: string): Promise<'added' | 'removed' | undefined> => {
    await this.tokenManager.Refresh()
    ;(await this.IsTrackSaved(_, id))
      ? await this.api.removeFromMySavedTracks([id]).then(() => Promise.resolve('removed'))
      : await this.api.addToMySavedTracks([id]).then(() => Promise.resolve('added'))

    return undefined
  }
}
