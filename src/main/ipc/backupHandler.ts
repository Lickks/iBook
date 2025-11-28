import { ipcMain, BrowserWindow } from 'electron'
import { backupService } from '../services/backup'
import { restoreService } from '../services/restore'
import type { BackupProgress } from '../services/backup'
import type { RestoreProgress } from '../services/restore'

/**
 * 设置备份相关的 IPC 处理器
 */
export function setupBackupHandlers(): void {
  /**
   * 创建备份
   * 需要从渲染进程获取 localStorage 数据
   */
  ipcMain.handle('backup:create', async (event, savePath?: string) => {
    try {
      // 首先从渲染进程获取 localStorage 数据
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      if (!mainWindow) {
        throw new Error('无法获取主窗口')
      }

      // 通过 IPC 获取 localStorage 数据
      const settings = await event.sender.executeJavaScript(`
        JSON.stringify({
          theme: localStorage.getItem('theme'),
          viewMode: localStorage.getItem('viewMode'),
          sidebarCollapsed: localStorage.getItem('sidebarCollapsed'),
          displayMode: localStorage.getItem('displayMode'),
          txtToEpub_chapterRule: localStorage.getItem('txtToEpub_chapterRule')
        })
      `)

      const settingsObj = JSON.parse(settings)

      // 创建备份（先不包含设置）
      const result = await backupService.createBackup(savePath, (progress: BackupProgress) => {
        // 发送进度更新到渲染进程
        event.sender.send('backup:progress', progress)
      })

      // 如果备份成功，更新设置文件
      if (result.success && result.path) {
        backupService.updateBackupSettings(result.path, settingsObj)
      }

      return result
    } catch (error: any) {
      console.error('创建备份失败:', error)
      return {
        success: false,
        error: error?.message || '创建备份失败'
      }
    }
  })

  /**
   * 恢复备份
   */
  ipcMain.handle('backup:restore', async (event, backupPath?: string) => {
    try {
      const mainWindow = BrowserWindow.fromWebContents(event.sender)
      if (!mainWindow) {
        throw new Error('无法获取主窗口')
      }

      const result = await restoreService.restoreBackup(backupPath, (progress: RestoreProgress) => {
        // 发送进度更新到渲染进程
        event.sender.send('backup:restore-progress', progress)
      })

      // 如果恢复成功，需要恢复 localStorage 设置并刷新数据
      if (result.success) {
        // 使用恢复服务返回的备份路径（可能来自对话框选择）
        const pathToUse = result.backupPath || backupPath

        if (pathToUse) {
          try {
            const settings = restoreService.getBackupSettings(pathToUse)

            // 通过 IPC 恢复 localStorage
            await event.sender.executeJavaScript(`
              (function() {
                const settings = ${JSON.stringify(settings)};
                if (settings.theme) localStorage.setItem('theme', settings.theme);
                if (settings.viewMode) localStorage.setItem('viewMode', settings.viewMode);
                if (settings.sidebarCollapsed) localStorage.setItem('sidebarCollapsed', settings.sidebarCollapsed);
                if (settings.displayMode) localStorage.setItem('displayMode', settings.displayMode);
                if (settings.txtToEpub_chapterRule) localStorage.setItem('txtToEpub_chapterRule', settings.txtToEpub_chapterRule);
              })();
            `)
          } catch (error) {
            console.error('恢复设置失败:', error)
            // 即使设置恢复失败，也继续发送完成事件，因为数据已经恢复
          }
        }

        // 通知渲染进程恢复完成（无论是否有设置，数据已经恢复）
        event.sender.send('backup:restore-complete')
      }

      return result
    } catch (error: any) {
      console.error('恢复备份失败:', error)
      return {
        success: false,
        error: error?.message || '恢复备份失败'
      }
    }
  })

  /**
   * 验证备份文件
   */
  ipcMain.handle('backup:validate', async (_event, backupPath: string) => {
    try {
      const validation = restoreService.validateBackup(backupPath)
      return validation
    } catch (error: any) {
      return {
        valid: false,
        error: error?.message || '验证备份文件失败'
      }
    }
  })

  /**
   * 获取备份文件信息
   */
  ipcMain.handle('backup:getInfo', async (_event, backupPath: string) => {
    try {
      const info = restoreService.getBackupInfo(backupPath)
      if (!info) {
        return {
          success: false,
          error: '无法读取备份文件信息'
        }
      }
      return {
        success: true,
        data: info
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || '获取备份文件信息失败'
      }
    }
  })
}

