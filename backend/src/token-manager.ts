import { BrowserWindow } from 'electron'
import SpotifyWebApi from 'spotify-web-api-node'
import SpotifyRedirectServer from './spotify-redirect-server'
import SpotbarElectronApp from './spotbar-app'
import crypto from 'crypto'
import moment from 'moment'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../../.env') })
interface TokenInfo {
   access: string
   refresh: string
   expires: moment.Moment
}

export default class SpotifyTokenManager {
   private readonly spotifyApi: SpotifyWebApi
   private readonly spotbarApp: SpotbarElectronApp
   private tokenInfo!: TokenInfo // ! to make ts shut up about initialization in ctor

   constructor(app: SpotbarElectronApp, api: SpotifyWebApi) {
      this.spotifyApi = api
      this.spotbarApp = app
   }

   public assign = async () => {
      this.tokenInfo = await this.getFromApi()
      this.spotifyApi.setAccessToken(this.tokenInfo.access)
      this.spotifyApi.setRefreshToken(this.tokenInfo.refresh)
   }

   public refreshIfExpired = async () => {
      if (this.isValid()) return

      const newTok = await this.spotifyApi.refreshAccessToken()
      this.tokenInfo = {
         access: newTok.body.access_token,
         refresh: newTok.body.refresh_token || this.tokenInfo.refresh, // If it's not present
         expires: moment().add(newTok.body.expires_in, 's')
      }

      this.spotifyApi.setAccessToken(this.tokenInfo.access)
      this.spotifyApi.setRefreshToken(this.tokenInfo.refresh)
   }

   private isValid = (): boolean => {
      return this.tokenInfo.expires.diff(moment(), 's') > 0
   }

   private getFromApi = async (): Promise<TokenInfo> => {
      this.spotifyApi.setRedirectURI('http://localhost:8888/cback')
      const responseServer = new SpotifyRedirectServer('/cback', 8888)

      const scopes = ['user-read-private', 'user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state']
      const state = crypto.randomBytes(20).toString('hex')
      const authURL = this.spotifyApi.createAuthorizeURL(scopes, state, false)

      let browser = new BrowserWindow({
         resizable: false,
         fullscreenable: false,
         minimizable: false,
         maximizable: false
      })

      setTimeout(() => {
         browser.loadURL(authURL)
         browser.show()
      }, 300)

      const code = await responseServer.getAuthorizationCode()

      this.spotbarApp.showAfterLogin()
      browser.close() // The electron window will not close if there's an error

      const tokens = await this.spotifyApi.authorizationCodeGrant(code)

      return {
         access: tokens.body.access_token,
         refresh: tokens.body.refresh_token,
         expires: moment().add(tokens.body.expires_in, 's')
      }
   }
}
