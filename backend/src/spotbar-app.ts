import { BrowserWindow, Menu, Tray, app, dialog, globalShortcut, nativeImage } from 'electron'
import isDev from 'electron-is-dev'
import positioner from 'electron-traywindow-positioner'
import path from 'path'
// try { require('electron-reloader')(module) } catch (_) {}

export default class SpotbarElectronApp {
   static RESOURCES = {
      html_file: path.join(__dirname, '../../../frontend/public/index.html'),
      icon_file: path.join(__dirname, '../../../assets/icon/icon_16x16@2x.png'),
      preload: path.join(__dirname, './preload.js')
   }

   // These attrs will be initialized in the whenReady callback, the ! assertion
   // is to silence TS erros complaining about not initializing them explicitly in the ctor
   private _window!: BrowserWindow
   private _tray!: Tray

   constructor(width: number = 700, height: number = 300) {
      app.dock.hide()
      app.on('window-all-closed', () => app.quit())
      app.whenReady().then(() => {
         globalShortcut.register('CommandOrControl+Q', () => app.quit())

         this.createWindow(width, height)
         this.createTray()
      })

      process.on('uncaughtException', (err) => {
         const messageBoxOptions = {
            type: 'error',
            title: 'Spotbar error',
            message: err.message
         }

         dialog.showMessageBoxSync(messageBoxOptions)
         app.exit(1)
      })
   }

   private createWindow = (width: number, height: number) => {
      this._window = new BrowserWindow({
         width: width,
         height: height,
         show: false,
         useContentSize: true,
         titleBarStyle: 'hidden',
         frame: false,
         resizable: false,
         fullscreenable: false,
         movable: false,
         minimizable: false,
         maximizable: false,
         closable: false,
         webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: SpotbarElectronApp.RESOURCES.preload
         }
      })

      this._window.loadURL(isDev ? 'http://localhost:3000' : SpotbarElectronApp.RESOURCES.html_file)
      this._window.setVisibleOnAllWorkspaces(true)
      this._window.setAlwaysOnTop(true)
      this._window.on('blur', () => this._window.hide())
   }

   private createTray = () => {
      const icon = nativeImage.createFromPath(SpotbarElectronApp.RESOURCES.icon_file)
      const contextMenu = Menu.buildFromTemplate([
         { label: 'About', role: 'about' },
         { label: 'Separator', type: 'separator' },
         { label: 'Start at Login', type: 'checkbox' },
         { label: 'Separator', type: 'separator' },
         { label: 'Logout Spotify Account', type: 'normal' },
         { label: 'Quit Spotbar', type: 'normal', role: 'quit' }
      ])

      this._tray = new Tray(icon)
      this._tray.setIgnoreDoubleClickEvents(true)
      this._tray.on('right-click', () => this._tray.popUpContextMenu(contextMenu))
      this._tray.on('click', () => {
         if (this._window.isVisible()) this._window.hide()
         else {
            positioner.position(this._window, this._tray.getBounds())
            this._window.show()
         }
      })
   }
}
