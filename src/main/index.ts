import { ipcMain } from 'electron'
import Spotbar from './spotbar'
import SpotifyApiManager from './spotify-api-mgr'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../../.env') })

const spotbar = new Spotbar()
const api = new SpotifyApiManager(spotbar, process.env.CLIENT_ID!, process.env.CLIENT_SECRET!)

ipcMain.handle('windowVisible', spotbar.ToggleVisibility)
ipcMain.on('quit', () => spotbar.Quit)

ipcMain.handle('getMe', api.GetMe)
ipcMain.handle('fetchPlaybackInfo', api.FetchPlaybackInfo)
ipcMain.handle('togglePlayback', api.TogglePlayback)
ipcMain.handle('skipTrack', api.SkipTrack)
ipcMain.handle('isTrackSaved', api.IsTrackSaved)
ipcMain.handle('toggleSaveTrack', api.ToggleSaveTrack)
