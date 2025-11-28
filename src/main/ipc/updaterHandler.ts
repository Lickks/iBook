import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { checkForUpdates, quitAndInstall } from '../services/updater'

/**
 * 更新相关的 IPC 处理器
 */
export function setupUpdaterHandlers(): void {
  /**
   * 手动检查更新
   */
  ipcMain.handle('updater:check', async (_event: IpcMainInvokeEvent) => {
    try {
      checkForUpdates()
      return { success: true }
    } catch (error: any) {
      console.error('检查更新失败:', error)
      return {
        success: false,
        error: error?.message || '检查更新失败'
      }
    }
  })

  /**
   * 退出并安装更新
   */
  ipcMain.handle('updater:quitAndInstall', async (_event: IpcMainInvokeEvent) => {
    try {
      quitAndInstall()
      return { success: true }
    } catch (error: any) {
      console.error('安装更新失败:', error)
      return {
        success: false,
        error: error?.message || '安装更新失败'
      }
    }
  })
}

