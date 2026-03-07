const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow: any = null;
let backendProcess: any = null;

function startBackend() {
  const isDev = !app.isPackaged;
  // In development, the backend is run via tsx in its own terminal or we can spawn it.
  // In production, we run the compiled server.js
  if (!isDev) {
    const serverPath = path.join((process as any).resourcesPath, 'backend', 'server.cjs');
    const userDataPath = app.getPath('userData');
    const puppeteerCache = path.join((process as any).resourcesPath, '.puppeteer');
    backendProcess = fork(serverPath, [], {
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        USER_DATA_PATH: userDataPath,
        PUPPETEER_CACHE_DIR: puppeteerCache
      }
    });
    
    backendProcess.on('error', (err: any) => {
      console.error('Failed to start backend process.', err);
    });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173'); 
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
