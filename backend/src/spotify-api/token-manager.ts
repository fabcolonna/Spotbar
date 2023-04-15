import SpotifyWebApi from 'spotify-web-api-node'
import SpotbarApplication from '../spotbar-app'

import { BrowserWindow } from 'electron'
import crypto from 'crypto'
import moment from 'moment'
import express from 'express'

import * as path from 'path'
import * as dotenv from 'dotenv'
import * as http from 'http'

dotenv.config({ path: path.join(__dirname, '../../../.env') })

const htmlResponses = {
   success: `<!DOCTYPE html><html lang='en'><body><h1>Spotify Authorization Success!</h1></body></html>`,
   failure: `<!DOCTYPE html><html lang='en'><body><h1>Sorry! Could not get Authorization</h1></body></html>`
}

interface TokenInfo {
   access: string
   refresh: string
   expires: moment.Moment
}

const spotifyScopes = [
   'user-read-private',
   'user-read-email',
   'user-read-currently-playing',
   'user-read-playback-state',
   'user-modify-playback-state'
]

export default class SpotifyTokenManager {
   private readonly spotbarApp: SpotbarApplication
   private readonly engine: SpotifyWebApi
   private token?: TokenInfo = undefined

   constructor(spotbarApp: SpotbarApplication, engine: SpotifyWebApi) {
      this.engine = engine
      this.spotbarApp = spotbarApp
   }

   public assign = async () => {
      if (this.valid()) return

      this.token = await this.retrieve() // If rejected, the error is propagated
      this.engine.setAccessToken(this.token.access)
      this.engine.setRefreshToken(this.token.refresh)
   }

   public refresh = async () => {
      if (this.valid()) return

      const res = await this.engine.refreshAccessToken() // If rejected, the error is propagated
      if (!res.body) throw new Error('Could not refresh token(s): Bad response')

      this.token = {
         access: res.body.access_token,
         refresh: res.body.refresh_token || this.token!.refresh, // If not present in the new toks data
         expires: moment().add(res.body.expires_in, 's')
      }

      this.engine.setAccessToken(this.token.access)
      this.engine.setRefreshToken(this.token.refresh)
   }

   public valid = (): boolean | undefined => {
      return this.token ? this.token.expires.diff(moment(), 's') > 0 : undefined
   }

   private retrieve = async (): Promise<TokenInfo> => {
      this.engine.setRedirectURI('http://localhost:8888/cback')
      const state = crypto.randomBytes(20).toString('hex')
      const authURL = this.engine.createAuthorizeURL(spotifyScopes, state, false)

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

      const code = await new Server('/cback', 8888).getAuthCode()
      this.spotbarApp.forceShow()
      browser.close()

      const tok = await this.engine.authorizationCodeGrant(code) // If rejected, it's propagated
      if (!tok.body) throw new Error('Could not get tokens: Bad response')

      return {
         access: tok.body.access_token,
         refresh: tok.body.refresh_token,
         expires: moment().add(tok.body.expires_in, 's')
      }
   }
}

class Server {
   private readonly endpoint: string
   private readonly port: number

   constructor(endpoint: string, port: number) {
      this.endpoint = (endpoint[0] !== '/' ? '/' : '') + endpoint
      this.port = port
   }

   public getAuthCode = (): Promise<string> => {
      return new Promise((resolve, reject) => {
         let server: http.Server

         const expr = express()
         expr.get(this.endpoint, (req, res) => {
            try {
               if (!req.query.code) {
                  res.send(htmlResponses.failure)
                  reject('Could not get authorization code: Bad request')
               } else {
                  res.send(htmlResponses.success)
                  resolve(req.query.code as string)
               }
            } finally { server.close(() => console.log('AuthServer closed')) }
         })

         server = expr.listen(this.port, () => console.log('AuthServer listening...'))
      })
   }
}
