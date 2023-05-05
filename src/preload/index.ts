import { contextBridge, ipcRenderer } from 'electron'
import { SpotifyCredentials, SpotifyDevice, SpotifyMe, SpotifyPlaybackInfo } from '../@types/spotify'

const spotifyApi = {
  getMe: (): Promise<SpotifyMe> => ipcRenderer.invoke('getMe'),
  fetchPlaybackInfo: (): Promise<SpotifyPlaybackInfo | undefined> => ipcRenderer.invoke('fetchPlaybackInfo'),
  togglePlayback: (value: 'play' | 'pause'): Promise<void> => ipcRenderer.invoke('togglePlayback', value),
  skipTrack: (which: 'previous' | 'next'): Promise<void> => ipcRenderer.invoke('skipTrack', which),
  isTrackSaved: (id: string): Promise<boolean> => ipcRenderer.invoke('isTrackSaved', id),
  toggleSaveTrack: (id: string): Promise<'added' | 'removed'> => ipcRenderer.invoke('toggleSaveTrack', id),
  getSpotifyConnectDevices: (): Promise<SpotifyDevice[]> => ipcRenderer.invoke('getDevices'),
  setVolume: (volume: number, device: SpotifyDevice): Promise<void> => ipcRenderer.invoke('setVolume', volume, device),
  changeStreamingDevice: (device: SpotifyDevice): Promise<void> => ipcRenderer.invoke('changeStreamingDevice', device)
}

const spotbarApi = {
  getOs: (): Promise<string> => ipcRenderer.invoke('getOs'),
  isVisible: (): Promise<boolean> => ipcRenderer.invoke('isWindowVisible'),
  quit: (): Promise<void> => ipcRenderer.invoke('quit'),
  resize: (how: 'big' | 'compact'): Promise<'big' | 'compact'> => ipcRenderer.invoke('resize', how),

  didFindCredentials: (): Promise<boolean> => ipcRenderer.invoke('didFindCredentials'),
  loadCredentials: (values: SpotifyCredentials): Promise<boolean> => ipcRenderer.invoke('loadCredentials', values),
  unloadCredentials: (): void => ipcRenderer.send('unloadCredentials')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('spotify', spotifyApi)
    contextBridge.exposeInMainWorld('spotbar', spotbarApi)
  } catch (error) {
    console.error(error)
  }
} else {
  window.spotify = spotifyApi
  window.spotbar = spotbarApi
}
