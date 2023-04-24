import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, Menu, nativeImage, shell, Tray } from 'electron'
import positioner from 'electron-traywindow-positioner'
import path from 'path'
import icon from '../../resources/icon.png?asset'
import trayIcon from '../../resources/icon_16x16@2x.png?asset'

export default class Spotbar {
  private readonly singleInstanceLock = app.requestSingleInstanceLock()
  private readonly width: number
  private readonly height: number
  private tray!: Tray
  private win!: BrowserWindow

  constructor(width = 720, height = 320) {
    ;[this.width, this.height] = [width, height]

    process.on('SIGINT', this.quit)
    process.on('SIGTERM', this.quit)

    // Multiple Spotbar instances are not allowed
    if (!this.singleInstanceLock) this.quit()
    else app.on('second-instance', () => this.win && this.toggleVisibility())

    app.on('window-all-closed', this.quit)
    app.on('browser-window-created', (_: any, window) => optimizer.watchWindowShortcuts(window))

    app.whenReady().then(() => {
      process.platform === 'darwin' && app.dock.hide()
      electronApp.setAppUserModelId('org.levar')

      this.tray = this.createTray()
      this.win = this.createWindow(this.width, this.height)
    })
  }

  public quit = (): void => {
    app.dock.isVisible() && app.dock.hide()
    this.tray && this.tray.destroy()
    app.quit()
    setTimeout(process.exit, 1000)
  }

  public toggleVisibility = (): void => {
    if (this.win.isVisible()) this.win.hide()
    else {
      positioner.position(this.win, this.tray.getBounds())
      this.win.show()
    }
  }

  private createWindow = (width: number, height: number): BrowserWindow => {
    const win = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      useContentSize: true,
      titleBarStyle: 'hidden',
      frame: false,
      resizable: false,
      autoHideMenuBar: true,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        sandbox: false,
        nodeIntegration: true,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/index.js')
      }
    })

    win.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    win.setVisibleOnAllWorkspaces(true)
    win.setAlwaysOnTop(true)
    win.on('blur', this.toggleVisibility)

    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? win.loadURL(process.env['ELECTRON_RENDERER_URL'])
      : win.loadFile(path.join(__dirname, '../renderer/index.html'))

    return win
  }

  private createTray = (): Tray => {
    const tray = new Tray(nativeImage.createFromPath(trayIcon))
    tray.setIgnoreDoubleClickEvents(true)

    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open/Close Spotbar', click: this.toggleVisibility },
      { label: 'Separator', type: 'separator' },
      { label: 'Quit', click: this.quit }
    ])

    // Linux doesn't support 'right-click' nor can send a click event to toggle visibility when the user
    // clicks directly on the menu bar icon. For Linux users, left click will toggle the context menu, which
    // will be accessible on the other OSes though right-click.
    if (process.platform === 'linux') tray.popUpContextMenu(contextMenu)
    else {
      tray.on('right-click', () => tray.popUpContextMenu(contextMenu))
      tray.on('click', this.toggleVisibility)
    }

    return tray
  }
}
