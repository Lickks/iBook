// ===== 必须在所有导入之前设置编码 =====
// 修复 Windows 控制台中文乱码问题
if (process.platform === 'win32') {
  // 设置环境变量
  if (!process.env.PYTHONIOENCODING) {
    process.env.PYTHONIOENCODING = 'utf-8'
  }

  // 设置控制台输出编码为 UTF-8
  try {
    // 方法1: 使用 execSync 设置代码页（适用于 cmd）
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { execSync } = require('child_process')
    execSync('chcp 65001 >nul 2>&1', { encoding: 'utf8', stdio: 'ignore', shell: true })
  } catch {
    // 忽略错误，继续执行
  }

  // 方法2: 直接设置 stdout/stderr 编码（如果支持）
  try {
    if (process.stdout && typeof process.stdout.setDefaultEncoding === 'function') {
      process.stdout.setDefaultEncoding('utf8')
    }
    if (process.stderr && typeof process.stderr.setDefaultEncoding === 'function') {
      process.stderr.setDefaultEncoding('utf8')
    }
  } catch {
    // 某些环境下可能不支持，忽略错误
  }
}

import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'

// 检测是否为开发环境
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
import { databaseService } from './services/database'
import { setupBookHandlers } from './ipc/bookHandler'
import { setupDocumentHandlers } from './ipc/documentHandler'
import { setupSearchHandlers } from './ipc/searchHandler'
import { registerStatsHandlers } from './ipc/statsHandler'
import { setupTagHandlers } from './ipc/tagHandler'
import { setupBookshelfHandlers } from './ipc/bookshelfHandler'
import { createWindowWithState } from './services/windowState'

function createWindow(): void {
  // 使用窗口状态管理服务创建窗口
  const mainWindow = createWindowWithState(icon)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.electron')
  }

  // 初始化数据库
  try {
    databaseService.initialize()
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }

  // 注册 IPC 处理器
  setupBookHandlers()
  setupDocumentHandlers()
  setupSearchHandlers()
  registerStatsHandlers()
  setupTagHandlers()
  setupBookshelfHandlers()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 应用退出时关闭数据库连接
app.on('before-quit', () => {
  databaseService.close()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
