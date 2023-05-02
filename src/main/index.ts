import dotenv from 'dotenv'
import { ipcMain } from 'electron'
import path from 'path'
import Spotbar from './spotbar'
import SpotifyApiManager from './spotify-api-mgr'

dotenv.config({ path: path.join(__dirname, '../../.env') })

const spotbar = new Spotbar()
const api = new SpotifyApiManager(spotbar, process.env.CLIENT_ID!, process.env.CLIENT_SECRET!)

ipcMain.handle('isWindowVisible', spotbar.isVisible)
ipcMain.handle('resize', spotbar.resize)
ipcMain.handle('quit', spotbar.quit)

ipcMain.handle('getMe', api.getMe)
ipcMain.handle('fetchPlaybackInfo', api.fetchPlaybackInfo)
ipcMain.handle('togglePlayback', api.togglePlayback)
ipcMain.handle('skipTrack', api.skipTrack)
ipcMain.handle('isTrackSaved', api.isTrackSaved)
ipcMain.handle('toggleSaveTrack', api.toggleSaveTrack)

ipcMain.handle('getDevices', api.getSpotifyConnectDevices)
ipcMain.handle('setVolume', api.setVolume)
ipcMain.handle('changeStreamingDevice', api.changeStreamingDevice)
