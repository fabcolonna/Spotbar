import SpotbarApplication from './spotbar-app'
import SpotifyApiManager from './spotify-api/api-manager'

import { ipcMain } from 'electron'
import electronReload from 'electron-reload'
import path from 'path'
import * as dotenv from 'dotenv'

electronReload(__dirname, {})
dotenv.config({ path: path.join(__dirname, '../../../.env') })

const spotbar = new SpotbarApplication()
const api = new SpotifyApiManager(spotbar, process.env.CLIENT_ID!, process.env.CLIENT_SECRET!)

ipcMain.handle('getMe', api.getMe)
ipcMain.handle('fetchPlaybackInfo', api.fetchPlaybackInfo)
