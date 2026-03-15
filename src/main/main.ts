import { app, BrowserWindow, Menu, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { registerIpcHandlers } from './ipc/handlers'

registerIpcHandlers()

const APP_NAME = 'Notes'
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function getAppIconPath(): string | undefined {
  const baseDir = path.join(__dirname, '..', '..')
  const inDist = path.join(baseDir, 'dist', 'sas.png')
  const inPublic = path.join(baseDir, 'public', 'sas.png')
  const inRoot = path.join(baseDir, 'sas.png')
  if (fs.existsSync(inDist)) return inDist
  if (fs.existsSync(inPublic)) return inPublic
  if (fs.existsSync(inRoot)) return inRoot
  return undefined
}

function createWindow(): void {
  const iconPath = getAppIconPath()
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: APP_NAME,
    icon: iconPath,
    backgroundColor: '#161a1d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    ...(process.platform === 'darwin'
      ? { titleBarStyle: 'hiddenInset' as const }
      : {}),
    autoHideMenuBar: true,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
