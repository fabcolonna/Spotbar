import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('spotifyApi', {
   loginGetMe: () => ipcRenderer.invoke('spotifyLoginGetMe')
})
