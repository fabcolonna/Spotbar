import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('spotify', {
   getMe: (): Promise<Spotify.Me> => ipcRenderer.invoke('getMe'),
   fetchPlaybackInfo: (): Promise<Spotify.PlaybackInfo | undefined> => ipcRenderer.invoke('fetchPlaybackInfo')
})
