const { app, Tray, BrowserWindow, nativeImage, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const axios = require('axios').default;
try { require('electron-reloader')(module); } catch (_) { }
const positioner = require('electron-traywindow-positioner');

const PRELOAD_FILE = path.join(__dirname, './preload.js');
const HTML_FILE = path.join(__dirname, '../../frontend/public/index.html');
const ICON_FILE = path.join(__dirname, '../../assets/icon.png');

if (process.platform == 'darwin')
   app.dock.hide();

app.on('window-all-closed', () => app.quit());
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

app.whenReady().then(() => {
   const window = makeWindow();
   makeTray(window);
});

const makeWindow = () => {
   const win = new BrowserWindow({
      width: 700, height: 300, show: false,
      useContentSize: true, titleBarStyle: 'hidden', frame: false,
      resizable: false, fullscreenable: false, movable: false,
      minimizable: false, maximizable: false, closable: false,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: true,
         preload: PRELOAD_FILE
      }
   });

   if (process.platform == 'win32')
      win.setSkipTaskbar(true);

   win.loadURL(isDev ? 'http://localhost:3000' : HTML_FILE);
   win.setVisibleOnAllWorkspaces(true);
   win.setAlwaysOnTop(true);

   win.on('blur', () => { // Lose focus action -> disappear (if not dev mode)
      if (!win.webContents.isDevToolsOpened() || isDev)
         win.hide();
   });

   return win;
}

const makeTray = (window) => {
   const tray = new Tray(nativeImage.createFromPath(ICON_FILE));
   tray.on('click', () => {
      if (window.isVisible())
         window.hide();
      else {
         positioner.position(window, tray.getBounds());
         window.show();
      }
   });
}

// IPC API handlers

ipcMain.handle("login", async (event, args) => {
   const expressAddress = 'http://localhost:8888/login';

   const result = await axios.get(expressAddress);

   const ext = await shell.openExternal(result.request.res.responseUrl); // Not working :(
   return ext;
});

