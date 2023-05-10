import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import AutoLaunch from 'auto-launch'
import { BrowserWindow, Menu, MenuItem, Tray, app, dialog, nativeImage, shell } from 'electron'
import positioner from 'electron-traywindow-positioner'
import path, { join } from 'path'

// @ts-ignore
import icon from '../../resources/icon.png?asset'

export default class Spotbar {
  private readonly widthMax = 720
  private readonly widthMin = 420
  private readonly height = 320

  private readonly singleInstanceLock = app.requestSingleInstanceLock()
  private readonly autoLauncher = new AutoLaunch({
    name: 'Spotbar',
    isHidden: true
  })

  private tray!: Tray
  private win!: BrowserWindow

  constructor() {
    process.on('SIGINT', this.quit)
    process.on('SIGTERM', this.quit)

    // Multiple Spotbar instances are not allowed
    if (!this.singleInstanceLock) this.quit()
    else
      app.on('second-instance', () => {
        dialog.showErrorBox('Spotbar Error', "There's already another instance of Spotbar running!")
        BrowserWindow.getAllWindows()
          .filter(win => win !== this.win)
          .forEach(other => other.close())
      })

    app.on('window-all-closed', this.quit)
    app.on('browser-window-created', (_: any, window) => {
      optimizer.watchWindowShortcuts(window)
      process.platform === 'darwin' && app.dock.hide()
    })

    app.whenReady().then(() => {
      electronApp.setAppUserModelId('org.levar')
      this.win = this.createWindow()
      this.tray = this.createTray()
    })
  }

  public quit = (): void => {
    if (this.win) this.win.isVisible() && this.win.hide()

    app.dock.isVisible() && app.dock.hide()
    this.tray && this.tray.destroy()
    app.quit()
    setTimeout(process.exit, 1000)
  }

  public sendClickEvent = (): void => {
    this.tray.emit('click')
  }

  public isVisible = (): boolean => (this.win ? this.win.isVisible() : false)

  private toggleVisibility = (): void => {
    if (this.win.isVisible()) this.win.hide()
    else {
      positioner.position(this.win, this.tray.getBounds())
      this.win.show()
    }
  }

  public resize = (_: any, how: 'big' | 'compact'): 'big' | 'compact' => {
    switch (how) {
      case 'big':
        this.win.setSize(this.widthMax, this.height, true)
        positioner.position(this.win, this.tray.getBounds())
        return 'big'
      case 'compact':
        this.win.setSize(this.widthMin, this.height, true)
        positioner.position(this.win, this.tray.getBounds())
        return 'compact'
    }
  }

  private createWindow = (): BrowserWindow => {
    const win = new BrowserWindow({
      width: this.widthMax,
      height: this.height,
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
    win.setSkipTaskbar(true)
    win.on('blur', win.hide)

    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? win.loadURL(process.env['ELECTRON_RENDERER_URL'])
      : win.loadFile(path.join(__dirname, '../renderer/index.html'))

    return win
  }

  private createTray = (): Tray => {
    const trayIcon = nativeImage.createFromPath(join(__dirname, '../../resources/IconTemplate@2x.png'))
    trayIcon.setTemplateImage(true)

    const tray = new Tray(trayIcon)

    const contextMenu = Menu.buildFromTemplate([
      { label: `Show/Hide Spotbar`, click: this.toggleVisibility },
      { label: 'Separator', type: 'separator' },
      { label: 'Launch at Login', type: 'checkbox', click: this.toggleAutoLauncher },
      { label: 'Separator', type: 'separator' },
      { label: 'Quit', click: this.quit }
    ])

    // Linux doesn't support 'right-click' nor can send a click event to toggle visibility when the user
    // clicks directly on the menu bar icon. For Linux users, left click will toggle the context menu, which
    // will be accessible on the other OSes though right-click.
    if (process.platform === 'linux') tray.setContextMenu(contextMenu)
    else {
      tray.on('right-click', () => tray.popUpContextMenu(contextMenu))
      tray.on('click', this.toggleVisibility)
    }

    return tray
  }

  private toggleAutoLauncher = (menuItem: MenuItem): void => {
    const showError = e => {
      dialog.showErrorBox('Spotbar Error', e.message)
      menuItem.checked = false
    }

    this.autoLauncher
      .isEnabled()
      .then(isIt => {
        console.log('Requested Toggle Autolaunch: Current status: ' + isIt)
        isIt
          ? this.autoLauncher
              .enable()
              .then(() => (menuItem.checked = true))
              .catch(showError)
          : this.autoLauncher
              .disable()
              .then(() => (menuItem.checked = false))
              .catch(showError)
      })
      .catch(showError)
  }
}
