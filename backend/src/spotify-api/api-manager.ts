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
      const id = this.engine.getClientId()
      const sec = this.engine.getClientSecret()

      console.log('CREDS!!! ', id, ' ', sec)
      if (!id || id.length === 0 || !sec || sec.length === 0)
         throw new Error('Missing Spotify credentials. Check the .env file!')

      await this.tokenManager.assign()

      const me = await this.engine.getMe()
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
            id: body.item.id,
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

   public togglePlayback = async (_: any, value: 'play' | 'pause') => {
      await this.tokenManager.refresh()
      value === 'play'
         ? await this.engine.play({})
         : await this.engine.pause({})
   }

   public skipTrack = async (_: any, which: 'previous' | 'next') => {
      await this.tokenManager.refresh()
      which === 'previous'
         ? await this.engine.skipToPrevious()
         : await this.engine.skipToNext()
   }

   public isTrackSaved = async (_: any, id: string): Promise<boolean> => {
      await this.tokenManager.refresh()
      const res = await this.engine.containsMySavedTracks([id])
      if (!res.body) throw new Error('Could not check if track: "' + id + '" is saved: Bad response')

      return res.body[0]
   }

   public toggleSaveTrack = (_: any, id: string): Promise<'added' | 'removed'> => {
      return new Promise(async resolve => {
         await this.tokenManager.refresh()

         await this.isTrackSaved(_, id)
            ? await this.engine.removeFromMySavedTracks([id]).then(() => resolve('removed'))
            : await this.engine.addToMySavedTracks([id]).then(() => resolve('added'))
      })
   }
}
