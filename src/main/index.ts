import axios from 'axios'
import { dialog, ipcMain } from 'electron'
import { existsSync, mkdir, readFileSync, unlinkSync, writeFileSync } from 'fs'
import * as os from 'os'
import path from 'path'
import { SpotifyCredentials } from '../@types/spotify'
import Spotbar from './spotbar'
import SpotifyApiManager from './spotify-api-mgr'

const SPOTBAR_DIR = `${os.homedir() + path.sep}.spotbar`
!existsSync(SPOTBAR_DIR) && mkdir(SPOTBAR_DIR, { recursive: true }, err => {
  dialog.showErrorBox('Spotbar error', `Could not create/retrieve Spotbar folder: ${err}. Spotbar will now close`)
  process.exit(1)
})

const TOK_FILE = `${SPOTBAR_DIR + path.sep}.info.sb`

const spotbar = new Spotbar()
ipcMain.handle('getOs', () => process.platform.toString())
ipcMain.handle('isWindowVisible', spotbar.isVisible)
ipcMain.handle('resize', spotbar.resize)
ipcMain.handle('quit', spotbar.quit)

let credentials: SpotifyCredentials | undefined
let api: SpotifyApiManager | undefined

const setEndpoints = () => {
  if (!api) return

  ipcMain.handle('getMe', api.getMe)
  ipcMain.handle('fetchPlaybackInfo', api.fetchPlaybackInfo)
  ipcMain.handle('togglePlayback', api.togglePlayback)
  ipcMain.handle('skipTrack', api.skipTrack)
  ipcMain.handle('isTrackSaved', api.isTrackSaved)
  ipcMain.handle('toggleSaveTrack', api.toggleSaveTrack)
  ipcMain.handle('getDevices', api.getSpotifyConnectDevices)
  ipcMain.handle('setVolume', api.setVolume)
  ipcMain.handle('changeStreamingDevice', api.changeStreamingDevice)
  ipcMain.handle('scrubTo', api.scrubTo)
  ipcMain.handle('getAudioData', api.getAudioData)
}

// At startup, it tries to find the credentials file
if (existsSync(TOK_FILE)) {
  try {
    credentials = JSON.parse(readFileSync(TOK_FILE).toString()) as SpotifyCredentials
    api = new SpotifyApiManager(spotbar, credentials.clientId, credentials.clientSecret)
    setEndpoints()
  } catch (_) {}
}

ipcMain.handle('didFindCredentials', () => !!credentials)

ipcMain.on('unloadCredentials', () => {
  ;[credentials, api] = [undefined, undefined]
  existsSync(TOK_FILE) && unlinkSync(TOK_FILE)
})

ipcMain.handle('loadCredentials', (_: any, creds: SpotifyCredentials): Promise<boolean> => {
  const authHeader = 'Basic ' + Buffer.from(creds.clientId + ':' + creds.clientSecret).toString('base64')

  return new Promise((resolve, _) => {
    axios
      .post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      .then(_ => {
        credentials = creds
        api = new SpotifyApiManager(spotbar, credentials.clientId, credentials.clientSecret)
        writeFileSync(TOK_FILE, JSON.stringify(credentials))
        setEndpoints()
        resolve(true)
      })
      .catch(_ => resolve(false))
  })
})
