import { BrowserWindow, Menu, Tray, app, globalShortcut, nativeImage } from 'electron'
import isDev from 'electron-is-dev'
import positioner from 'electron-traywindow-positioner'
import path from 'path'
// try { require('electron-reloader')(module) } catch (_) {}

export default class SpotbarElectronApp {
   private static readonly RESOURCES = {
      html_file: path.join(__dirname, '../../../frontend/public/index.html'),
      icon_file: path.join(__dirname, '../../../assets/icon/icon_16x16@2x.png'),
      preload: path.join(__dirname, './preload.js')
   }

   // These attrs will be initialized in the whenReady callback, the ! assertion
   // is to silence TS erros complaining about not initializing them explicitly in the ctor
   private win!: BrowserWindow
   private tray!: Tray

   public get window() {
      return this.win
   }

   constructor(width: number = 700, height: number = 300) {
      app.dock.hide()
      app.on('window-all-closed', () => app.quit())
      app.whenReady().then(() => {
         //globalShortcut.register('CommandOrControl+Q', () => app.quit())
         this.createWindow(width, height)
         this.createTray()
      })
   }

   private createWindow = (width: number, height: number) => {
      this.win = new BrowserWindow({
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

      this.win.loadURL(isDev ? 'http://localhost:3000' : SpotbarElectronApp.RESOURCES.html_file)
      this.win.setVisibleOnAllWorkspaces(true)
      this.win.setAlwaysOnTop(true)
      this.win.on('blur', () => this.win.hide())
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

      /// TODO -> MAKE CONTEXT MENU WORK!

      this.tray = new Tray(icon)
      this.tray.setIgnoreDoubleClickEvents(true)
      this.tray.on('right-click', () => this.tray.popUpContextMenu(contextMenu))
      this.tray.on('click', () => {
         if (this.win.isVisible()) this.win.hide()
         else {
            positioner.position(this.win, this.tray.getBounds())
            this.win.show()
         }
      })
   }

   public showAfterLogin = () => this.tray.emit('click')
}
