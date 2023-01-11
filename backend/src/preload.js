const { contextBridge, ipcRenderer } = require('electron');;

contextBridge.exposeInMainWorld("api", {
   login: (args) => ipcRenderer.invoke("login", args)
});