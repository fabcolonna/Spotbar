import axios from 'axios'
import * as dotenv from 'dotenv'
import { ipcMain } from 'electron'
import electronReload from 'electron-reload'
import path from 'path'
import SpotifyWebApi from 'spotify-web-api-node'
import SpotbarElectronApp from './spotbar-app'
import SpotifyTokenManager from './token-manager'

electronReload(__dirname, {})
dotenv.config({ path: path.join(__dirname, '../../../.env') })

/* process.on('uncaughtException', (err) => {
   dialog.showErrorBox('Spotbar error', 'Something went wrong: ' + err)
}) */

const spotbar = new SpotbarElectronApp()
const spotifyHandle = new SpotifyWebApi({
   clientId: process.env.CLIENT_ID,
   clientSecret: process.env.CLIENT_SECRET
})

// It will also retrieve tokens for subsequent requests
const spotifyTokenManager = new SpotifyTokenManager(spotbar, spotifyHandle)

/////////   IPC FUNCTIONS   /////////

ipcMain.handle('spotifyLoginGetMe', async (): Promise<SpotifyMe> => {
   //await checkInternet() // If not connected, this should reject the Promise, hence throwing error

   await spotifyTokenManager.assign()
   const userInfo = await spotifyHandle.getMe().catch(() => {
      return Promise.reject('Could not retrieve your profile info from Spotify')
   })

   if (userInfo.body.product !== 'premium') return Promise.reject('Non Premium accounts are not supported by Spotbar')

   return {
      name: userInfo.body.display_name!, // ! because a profile should always have a name?
      image: !userInfo.body.images || userInfo.body.images.length === 0 ? undefined : userInfo.body.images[0]
   }
})

ipcMain.handle('spotifyGetPlaybackStatus', async (): Promise<SpotifyPlaybackStatus | undefined> => {
   //await checkInternet(15000) // We wait 15 seconds before quitting
   
   await spotifyTokenManager.refreshIfExpired()
   const status = await spotifyHandle.getMyCurrentPlaybackState()

   const details = status.body || undefined
   if (!details) return Promise.reject('Bad API request')

   // If context doesn't exist, Spotify is closed everywhere
   if (!details.context || !details.item) return undefined

   if (details.item) {
      return {
         device: {
            name: details.device.name,
            type: details.device.type,
            volume: details.device.volume_percent
         },
         track: {
            title: details.item.name,
            // @ts-ignore
            artists: details.item['artists'].map((obj) => obj.name).join(','),
            // @ts-ignore
            album: details.item['album'].name,
            // @ts-ignore
            albumImage: details.item['album'].images[0],
            progressMilli: details.progress_ms,
            durationMilli: details.item.duration_ms
         },
         isPlaying: details.is_playing
      }
   }
})
