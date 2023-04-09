import * as dotenv from 'dotenv'
import { ipcMain } from 'electron'
import electronReload from 'electron-reload'
import path from 'path'
import SpotifyWebApi from 'spotify-web-api-node'
import SpotbarElectronApp from './spotbar-app'
import SpotifyTokenManager from './token-manager'

electronReload(__dirname, {})
dotenv.config({ path: path.join(__dirname, '../../../.env') })

const spotbar = new SpotbarElectronApp()
const spotifyHandle = new SpotifyWebApi({
   clientId: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET
})

// It will also retrieve tokens for subsequent requests
const spotifyTokenManager = new SpotifyTokenManager(spotbar, spotifyHandle)

/////////   IPC FUNCTIONS   /////////

ipcMain.handle('spotifyLoginGetMe', async (): Promise<SpotifyMe> => {
   await spotifyTokenManager.assign().catch((err) => {
      return Promise.reject("Token assignment: " + err)
   })

   const userInfo = await spotifyHandle.getMe().catch((err) => {
      return Promise.reject("Couldn't get user info")
   })

   if (userInfo.body.product !== 'premium') return Promise.reject('Non Premium accounts are not supported by Spotbar')

   return {
      name: userInfo.body.display_name!, // ! because a profile should always have a name?
      image: !userInfo.body.images || userInfo.body.images.length === 0 ? undefined : userInfo.body.images[0]
   }
})

ipcMain.handle('spotifyGetPlayingTrack', async (): Promise<SpotifyPlayingTrack | undefined> => {
   await spotifyTokenManager.refreshIfExpired().catch((err) => {
      return Promise.reject("Token refresh: " + err)
   })

   const playingNow = await spotifyHandle.getMyCurrentPlayingTrack().catch(() => {
      return Promise.reject('Could not get currently playing track')
   })

   const details = playingNow.body.item

   return !details
      ? undefined
      : {
           name: details.name,
           // @ts-ignore
           artist: details['artists'][0].name,
           // @ts-ignore
           albumImage: details['album'].images[0],
           // @ts-ignore
           album: details['album'].name
        }
})
