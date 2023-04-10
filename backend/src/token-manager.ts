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
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(__dirname, '../../../.env') })
interface TokenInfo {
   access: string
   refresh: string
   expires: moment.Moment
}

export default class SpotifyTokenManager {
   private static readonly TOK_FILE_PATH = path.join(os.tmpdir(), process.env.TFILE!)
   private static readonly KEY_FILE_PATH = path.join(os.tmpdir(), process.env.KFILE!)

   private readonly spotifyApi: SpotifyWebApi
   private readonly spotbarApp: SpotbarElectronApp
   private tokenInfo!: TokenInfo // ! to make ts shut up about initialization in ctor

   constructor(app: SpotbarElectronApp, api: SpotifyWebApi) {
      this.spotifyApi = api
      this.spotbarApp = app
   }

   public assign = async () => {
      const filesExist = fs.existsSync(SpotifyTokenManager.TOK_FILE_PATH) && fs.existsSync(SpotifyTokenManager.KEY_FILE_PATH)
      if (filesExist) {
         this.tokenInfo = this.getFromFile()
         console.log("Got something from file")
      }

      if (!filesExist || !this.isValid()) {
         console.log("File not found or invalid token, requesting")
         this.tokenInfo = await this.getFromApi()
         this.encryptAndSave()
      }

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
      const authURL = this.spotifyApi.createAuthorizeURL(scopes, state, true)

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

   private getFromFile = (): TokenInfo => {
      const hexKeys = fs.readFileSync(SpotifyTokenManager.KEY_FILE_PATH, 'hex')
      const regKeys = cryptojs.enc.Hex.parse(hexKeys).toString(cryptojs.enc.Utf8)
      const { key, iv } = JSON.parse(regKeys)
      console.log("got: " + key)
      
      const enc = fs.readFileSync(SpotifyTokenManager.TOK_FILE_PATH).toString()
      return JSON.parse(cryptojs.AES.decrypt(enc, key, { iv: iv }).toString())
   }

   private encryptAndSave = () => {
      const keys = {
         key: cryptojs.lib.WordArray.random(16),
         iv: cryptojs.lib.WordArray.random(16)
      }
      console.log(keys.key)

      const hexKeys = cryptojs.enc.Hex.stringify(cryptojs.enc.Hex.parse(JSON.stringify(keys)))
      fs.writeFileSync(SpotifyTokenManager.KEY_FILE_PATH, hexKeys)

      const encData = cryptojs.AES.encrypt(JSON.stringify(this.tokenInfo), keys.key, { iv: keys.iv }).ciphertext.toString()
      fs.writeFileSync(SpotifyTokenManager.TOK_FILE_PATH, encData)
   }
}
