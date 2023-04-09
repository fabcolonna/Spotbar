import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('spotifyApi', {
   loginGetMe: (): Promise<SpotifyMe> => ipcRenderer.invoke('spotifyLoginGetMe'),
   getPlayingTrack: (): Promise<SpotifyPlayingTrack> | undefined => ipcRenderer.invoke('spotifyGetPlayingTrack')
})
