const electron = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const { app, BrowserWindow, ipcMain } = electron;

const preventQuit = e => e.preventDefault();

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 345,
    height: 80,
    resizable: false,
    frame: false,
  });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('will-quit', preventQuit);

let speakCallback = () => {};
app.on('ready', async () => {
  speakCallback = await require('./assistant')();
  app.removeListener('will-quit', preventQuit);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('speak', event => speakCallback(event));
