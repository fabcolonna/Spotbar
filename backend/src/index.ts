import { shell, ipcMain } from 'electron'
import SpotbarElectronApp from './spotbar-app'
import SpotifyRedirectServer from './spotify-redirect-server'
import SpotifyWebApi from 'spotify-web-api-node'
import crypto from 'crypto'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../../.env') })

const redirectPort = 8888
const redirectEndpointName = '/cback'

const spotbar = new SpotbarElectronApp()

const spotifyHandle = new SpotifyWebApi({
   clientId: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET,
   redirectUri: 'http://localhost:' + redirectPort + redirectEndpointName
})

ipcMain.handle('spotifyLoginGetMe', async (): Promise<SpotifyMe> => {
   const responseServer = new SpotifyRedirectServer('/cback', 8888)

   const scopes = ['user-read-private', 'user-read-email']
   const state = crypto.randomBytes(20).toString('hex')
   const authURL = spotifyHandle.createAuthorizeURL(scopes, state, true)

   setTimeout(() => shell.openExternal(authURL), 200); // So server listens before the browser opens
   const code = await responseServer.getAuthorizationCode()
   if (!code)
      throw new Error("There was an error while trying to get login authorization code")

   const tokens = await spotifyHandle.authorizationCodeGrant(code)
   if (!tokens)
      throw new Error("There was an error while trying to get login tokens")

   spotifyHandle.setAccessToken(tokens.body.access_token)
   spotifyHandle.setRefreshToken(tokens.body.refresh_token)

   const userInfo = await spotifyHandle.getMe()
   if (!userInfo)
      throw new Error("There was an error while trying to get user's info")

   if (userInfo.body.product !== 'premium')
      throw new Error("Non Premium accounts are not supported by Spotbar")

   return { 
      name: userInfo.body.display_name!,
      image: (!userInfo.body.images || userInfo.body.images.length === 0) ? undefined : userInfo.body.images[0]
   }
})
