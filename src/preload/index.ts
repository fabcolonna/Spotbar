import { contextBridge, ipcRenderer } from 'electron'
import { SpotifyCredentials, SpotifyMe, SpotifyPlaybackInfo } from '../@types/spotify'

const spotifyApi = {
  getMe: (): Promise<SpotifyMe> => ipcRenderer.invoke('getMe'),
  fetchPlaybackInfo: (): Promise<SpotifyPlaybackInfo | undefined> => ipcRenderer.invoke('fetchPlaybackInfo'),
  togglePlayback: (value: 'play' | 'pause'): Promise<void> => ipcRenderer.invoke('togglePlayback', value),
  skipTrack: (which: 'previous' | 'next'): Promise<void> => ipcRenderer.invoke('skipTrack', which),
  isTrackSaved: (id: string): Promise<boolean> => ipcRenderer.invoke('isTrackSaved', id),
  toggleSaveTrack: (id: string): Promise<'added' | 'removed'> => ipcRenderer.invoke('toggleSaveTrack', id)
}

const spotbarApi = {
  isVisible: (): Promise<boolean> => ipcRenderer.invoke('windowVisible'),
  setCredentials: (creds: SpotifyCredentials): void => ipcRenderer.send('setCredentials', creds),
  unsetCredentials: (): void => ipcRenderer.send('unsetCredentials'),
  quit: (): void => ipcRenderer.send('quit')
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
