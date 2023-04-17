import { app, BrowserWindow, nativeImage, Tray, Menu } from 'electron'
import isDev from 'electron-is-dev'
import positioner from 'electron-traywindow-positioner'
import path from 'path'

const resources = {
   html: path.join(__dirname, '../../../frontend/public/index.html'),
   icon: path.join(__dirname, '../../../assets/icon/icon_16x16@2x.png'),
   preload: path.join(__dirname, './preload.js')
}

// TODO: ADD FULLSCREEN SUPPORT

export default class SpotbarApplication {
   private win!: BrowserWindow
   private tray!: Tray

   constructor(width: number = 720, height: number = 320) {
      if (process.platform === 'darwin') app.dock.hide()

      app.on('window-all-closed', () => app.quit())
      app.whenReady().then(() => {
         this.win = this.makeWindow(width, height)
         this.tray = this.makeTray()
      })
   }

   private makeWindow = (width: number, height: number): BrowserWindow => {
      const win = new BrowserWindow({
         width: width,
         height: height,
         show: false,
         useContentSize: true,
         titleBarStyle: 'hidden',
         frame: false,
         resizable: false,
         //fullscreenable: false,
         movable: false,
         minimizable: false,
         maximizable: false,
         closable: false,
         webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: resources.preload
         }
      })

      win.loadURL(isDev ? 'http://localhost:3000' : resources.html)
      win.setVisibleOnAllWorkspaces(true)
      win.setAlwaysOnTop(true)
      win.on('blur', () => this.win.hide())

      return win
   }

   private makeTray = (): Tray => {
      const icon = nativeImage.createFromPath(resources.icon)

      const toggleVisibility = () => {
         if (this.win.isVisible()) this.win.hide()
         else {
            positioner.position(this.win, this.tray.getBounds())
            this.win.show()
         }
      }

      const tray = new Tray(icon)
      process.platform === 'darwin' && tray.setIgnoreDoubleClickEvents(true)

      // Linux handles tray icons differently: a context menu is needed to open/quit the app
      // because the 'click' event on the tray object itself is never sent
      if (process.platform === 'linux') {
         const contextMenu = Menu.buildFromTemplate([
            { label: 'Open Spotbar', click: toggleVisibility },
            { label: 'Quit', click: () => app.quit() }
         ])

         tray.setContextMenu(contextMenu)
      }

      tray.on('click', () => process.platform !== 'linux' && toggleVisibility())

      return tray
   }

   public forceShow = () => this.tray.emit('click')

   public visible = () => this.win.isVisible()
}
