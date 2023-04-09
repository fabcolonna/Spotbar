import { BrowserWindow } from 'electron'
import SpotifyWebApi from 'spotify-web-api-node'
import SpotifyRedirectServer from './spotify-redirect-server'
import SpotbarElectronApp from './spotbar-app'
import crypto from 'crypto'
import moment from 'moment'
import cryptojs from 'crypto-js'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

interface TokenInfo {
   access: string
   refresh: string
   expires: moment.Moment
}

export default class SpotifyTokenManager {
   private static readonly TOK_FILE_PATH = path.join(os.tmpdir(), 'tk.sb')

   private readonly spotifyApi: SpotifyWebApi
   private readonly spotbarApp: SpotbarElectronApp
   private tokenInfo!: TokenInfo // ! to make ts shut up about initialization in ctor

   constructor(app: SpotbarElectronApp, api: SpotifyWebApi) {
      this.spotifyApi = api
      this.spotbarApp = app
   }

   public assign = async () => {
      let done = false

      if (fs.existsSync(SpotifyTokenManager.TOK_FILE_PATH)) {
         this.tokenInfo = this.getFromFile()
         if (!this.isValid()) console.log('File contained expired tokens. Refresh necessary')
         else {
            console.log('File contained valid tokens. Using them')
            done = true
         }
      }

      if (!done) {
         this.tokenInfo = await this.getFromApi().catch((err) => {
            return Promise.reject(err)
         })

         console.log('File not found. Got initial tokens from API')
         this.encryptAndSave()
      }

      this.spotifyApi.setAccessToken(this.tokenInfo.access)
      this.spotifyApi.setRefreshToken(this.tokenInfo.refresh)
   }

   public refreshIfExpired = async () => {
      if (this.isValid()) {
         console.log('Skipping reassignment: Token still valid')
         return
      }

      console.log('Token expired, requesting a new one')
      const newTok = await this.spotifyApi.refreshAccessToken().catch(() => {
         return Promise.reject("Could not refresh tokens")
      })

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
      const redirectPort = 8888
      const redirectEndpointName = '/cback'

      this.spotifyApi.setRedirectURI('http://localhost:' + redirectPort + redirectEndpointName)
      const responseServer = new SpotifyRedirectServer('/cback', 8888)

      const scopes = ['user-read-private', 'user-read-email', 'user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state']
      const state = crypto.randomBytes(20).toString('hex')
      const authURL = this.spotifyApi.createAuthorizeURL(scopes, state, true)

      let browser = new BrowserWindow({
         resizable: false,
         fullscreenable: false,
         minimizable: false,
         maximizable: false
      })

      setTimeout(() => {
         //browser.on('blur', () => browser.close())
         browser.loadURL(authURL)
         browser.show()
      }, 300) // So server listens before the browser opens

      const code = await responseServer.getAuthorizationCode().catch(() => {
         return Promise.reject('Could not retrieve login authorization code')
      })

      this.spotbarApp.showAfterLogin()
      browser.close() // The electron window will not close if there's an error

      const tokens = await this.spotifyApi.authorizationCodeGrant(code).catch(() => {
         return Promise.reject('Could not retrieve token(s)')
      })

      return {
         access: tokens.body.access_token,
         refresh: tokens.body.refresh_token,
         expires: moment().add(tokens.body.expires_in, 's')
      }
   }

   private getFromFile = (): TokenInfo => {
      throw new Error('UNIMPLEMENTED')
   }

   private encryptAndSave = () => {
      const key = cryptojs.lib.WordArray.random(16)
      const iv = cryptojs.lib.WordArray.random(16)

      const obj = {
         key: key,
         iv: iv,
         data: cryptojs.AES.encrypt(JSON.stringify(this.tokenInfo), key, { iv: iv }).ciphertext.toString()
      }

      const hexStr = cryptojs.enc.Hex.stringify(cryptojs.enc.Hex.parse(JSON.stringify(obj)))
      fs.writeFileSync(SpotifyTokenManager.TOK_FILE_PATH, JSON.stringify(obj))
      console.log(obj + ' ::: ' + SpotifyTokenManager.TOK_FILE_PATH)
   }
}
