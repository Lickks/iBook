import { autoUpdater } from 'electron-updater'
import { BrowserWindow, app } from 'electron'

let mainWindow: BrowserWindow | null = null

/**
 * 初始化自动更新
 * 仅在生产环境且应用已打包时启用
 */
export function initUpdater(window: BrowserWindow): void {
  mainWindow = window

  // 仅在生产环境启用自动更新
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('开发环境，跳过自动更新')
    return
  }

  // 配置自动更新
  autoUpdater.checkForUpdatesAndNotify()

  // 检查更新
  autoUpdater.on('checking-for-update', () => {
    console.log('正在检查更新...')
    sendStatusToWindow('checking-for-update')
  })

  // 发现更新
  autoUpdater.on('update-available', (info) => {
    console.log('发现新版本:', info.version)
    sendStatusToWindow('update-available', info)
  })

  // 没有更新
  autoUpdater.on('update-not-available', (info) => {
    console.log('当前已是最新版本:', info.version)
    sendStatusToWindow('update-not-available', info)
  })

  // 更新错误
  autoUpdater.on('error', (err) => {
    console.error('更新检查失败:', err)
    sendStatusToWindow('error', { message: err.message })
  })

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    const message = `下载进度: ${Math.round(progressObj.percent)}%`
    console.log(message)
    sendStatusToWindow('download-progress', progressObj)
  })

  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    console.log('更新下载完成:', info.version)
    sendStatusToWindow('update-downloaded', info)
  })
}

/**
 * 手动检查更新
 */
export function checkForUpdates(): void {
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('开发环境，跳过更新检查')
    return
  }
  autoUpdater.checkForUpdatesAndNotify()
}

/**
 * 退出并安装更新
 */
export function quitAndInstall(): void {
  autoUpdater.quitAndInstall(false, true)
}

/**
 * 发送更新状态到渲染进程
 */
function sendStatusToWindow(status: string, data?: any): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater-status', { status, data })
  }
}

