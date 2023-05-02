import crypto from 'crypto'
import { BrowserWindow } from 'electron'
import express from 'express'
import * as http from 'http'
import moment from 'moment'
import SpotifyWebApi from 'spotify-web-api-node'
import Spotbar from './spotbar'

interface TokenInfo {
  access: string
  refresh: string
  expires: moment.Moment
}

export default class SpotifyTokenManager {
  private static SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-library-modify',
    'user-library-read'
  ]

  private readonly spotbar: Spotbar
  private readonly api: SpotifyWebApi
  private token?: TokenInfo = undefined

  constructor(spotbar: Spotbar, api: SpotifyWebApi) {
    this.api = api
    this.spotbar = spotbar
  }

  public assign = async (): Promise<void> => {
    if (this.valid()) return

    this.token = await this.retrieve()
    this.api.setAccessToken(this.token.access)
    this.api.setRefreshToken(this.token.refresh)
  }

  public refresh = async (): Promise<void> => {
    if (this.valid()) return

    const res = await this.api.refreshAccessToken()
    if (!res.body) throw new Error('Could not refresh token(s): Bad response')

    this.token = {
      access: res.body.access_token,
      refresh: res.body.refresh_token || this.token!.refresh, // Refresh may be absent in the refresh object
      expires: moment().add(res.body.expires_in, 's')
    }

    this.api.setAccessToken(this.token.access)
    this.api.setRefreshToken(this.token.refresh)
  }

  public valid = (): boolean | undefined => (this.token ? this.token.expires.diff(moment(), 's') > 0 : undefined)

  private retrieve = async (): Promise<TokenInfo> => {
    this.api.setRedirectURI('http://localhost:8888/cback')
    const state = crypto.randomBytes(20).toString('hex')
    const authURL = this.api.createAuthorizeURL(SpotifyTokenManager.SCOPES, state, false)

    const browser = new BrowserWindow({
      resizable: false,
      fullscreenable: false,
      minimizable: false,
      maximizable: false
    })
    setTimeout(() => {
      browser.loadURL(authURL)
      browser.show()
    }, 300) // Waits for the server to load

    const code = await new Server('/cback', 8888).getAuthCode()
    this.spotbar.sendClickEvent()
    browser.close()

    const tok = await this.api.authorizationCodeGrant(code)
    if (!tok.body) throw new Error('Could not get tokens: Bad response')

    return {
      access: tok.body.access_token,
      refresh: tok.body.refresh_token,
      expires: moment().add(tok.body.expires_in, 's')
    }
  }
}

class Server {
  private static RESPONSES = {
    success: `<!DOCTYPE html><html lang="en"><body><h1>Spotify Authorization Success!</h1></body></html>`,
    failure: `<!DOCTYPE html><html lang="en"><body><h1>Sorry! Could not get Authorization</h1></body></html>`
  }

  private readonly endpoint: string
  private readonly port: number

  constructor(endpoint: string, port: number) {
    this.endpoint = (endpoint[0] !== '/' ? '/' : '') + endpoint
    this.port = port
  }

  public getAuthCode = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let server: http.Server

      const expr = express()
      expr.get(this.endpoint, (req, res) => {
        try {
          if (!req.query.code) {
            res.send(Server.RESPONSES.failure)
            reject('Could not get authorization code: Bad request')
          } else {
            res.send(Server.RESPONSES.success)
            resolve(req.query.code as string)
          }
        } finally {
          server.close(() => console.log('AuthServer closed'))
        }
      })

      server = expr.listen(this.port, () => console.log('AuthServer listening...'))
    })
  }
}
