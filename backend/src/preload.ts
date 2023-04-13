import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('spotifyApi', {
   loginGetMe: (): Promise<SpotifyMe> => ipcRenderer.invoke('spotifyLoginGetMe'),
   getPlaybackStatus: (): Promise<SpotifyPlaybackStatus | undefined> => ipcRenderer.invoke('spotifyGetPlaybackStatus')
})
