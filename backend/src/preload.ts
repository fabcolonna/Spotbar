import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('spotbar', {
   isVisible: (): Promise<boolean> => ipcRenderer.invoke('windowVisible')
})

contextBridge.exposeInMainWorld('spotify', {
   getMe: (): Promise<Spotify.Me> => ipcRenderer.invoke('getMe'),
   fetchPlaybackInfo: (): Promise<Spotify.PlaybackInfo | undefined> => ipcRenderer.invoke('fetchPlaybackInfo'),
   togglePlayback: (value: 'play' | 'pause'): Promise<void> => ipcRenderer.invoke('togglePlayback', value),
   skipTrack: (which: 'previous' | 'next'): Promise<void> => ipcRenderer.invoke('skipTrack', which),
   isTrackSaved: (id: string): Promise<boolean> => ipcRenderer.invoke('isTrackSaved', id),
   toggleSaveTrack: (id: string): Promise<'added' | 'removed'> => ipcRenderer.invoke('toggleSaveTrack', id)
})
