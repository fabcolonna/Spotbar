import SpotifyWebApi from 'spotify-web-api-node'
import SpotbarApplication from '../spotbar-app'
import SpotifyTokenManager from './token-manager'

export default class SpotifyApiManager {
   private readonly engine: SpotifyWebApi
   private readonly tokenManager: SpotifyTokenManager

   constructor(spotbarApp: SpotbarApplication, clientId: string, clientSecret: string) {
      this.engine = new SpotifyWebApi({ clientId: clientId, clientSecret: clientSecret })
      this.tokenManager = new SpotifyTokenManager(spotbarApp, this.engine)
   }

   public getMe = async (): Promise<Spotify.Me> => {
      await this.tokenManager.assign()
      const me = await this.engine.getMe() // If rejected, error is propagated
      if (!me.body) throw new Error('Could not retrieve your Spotify profile info: Bad response')

      const body = me.body
      if (body.product !== 'premium') throw new Error('Sorry, non-Premium accounts are not supported by Spotbar')

      return {
         name: body.display_name!, // Profile must have a name :/
         image: !body.images || body.images.length === 0 ? undefined : body.images[0]
      }
   }

   public fetchPlaybackInfo = async (): Promise<Spotify.PlaybackInfo | undefined> => {
      if (this.tokenManager.valid() === undefined) throw new Error('Could not get playback info: Did you log in? :/')

      await this.tokenManager.refresh()
      const info = await this.engine.getMyCurrentPlaybackState() // If rejected, error is propagated
      if (!info.body) throw new Error('Could not get playback info: Bad response')

      const body = info.body

      return body.item ? {
         device: {
            name: body.device.name,
            type: body.device.type,
            volume: body.device.volume_percent
         },
         track: {
            title: body.item.name,
            // @ts-ignore
            artists: body.item['artists'].map(obj => obj.name).join(', '),

            // @ts-ignore
            album: body.item['album'].name,

            // @ts-ignore
            albumArt: body.item['album'].images && body.item['album'].images[0],
            progressMs: body.progress_ms,
            durationMs: body.item.duration_ms
         },
         playing: body.is_playing
      } : undefined
   }
}
