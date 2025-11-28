import { app, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs'
import { readdirSync, statSync } from 'fs'
import AdmZip from 'adm-zip'
import { databaseService } from './database'
import type { BackupMetadata } from './backup'

export interface RestoreProgress {
  stage: 'validating' | 'backing-up' | 'extracting' | 'database' | 'documents' | 'covers' | 'settings' | 'complete'
  progress: number
  message: string
}

/**
 * 恢复服务
 * 负责从备份文件恢复数据
 */
class RestoreService {
  private getDbPath(): string {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'ibook.db')
  }

  private getDocumentsDir(): string {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'documents')
  }

  private getCoversDir(): string {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'covers')
  }

  private getWindowStatePath(): string {
    const userDataPath = app.getPath('userData')
    return join(userDataPath, 'window-state.json')
  }

  /**
   * 验证备份文件
   */
  validateBackup(backupPath: string): { valid: boolean; metadata?: BackupMetadata; error?: string } {
    try {
      if (!existsSync(backupPath)) {
        return { valid: false, error: '备份文件不存在' }
      }

      const zip = new AdmZip(backupPath)
      const entries = zip.getEntries()

      // 检查必需文件
      const requiredFiles = ['metadata.json', 'database/ibook.db']
      const missingFiles: string[] = []

      for (const file of requiredFiles) {
        const entry = entries.find((e) => e.entryName === file)
        if (!entry) {
          missingFiles.push(file)
        }
      }

      if (missingFiles.length > 0) {
        return {
          valid: false,
          error: `备份文件不完整，缺少文件: ${missingFiles.join(', ')}`
        }
      }

      // 读取元数据
      const metadataEntry = entries.find((e) => e.entryName === 'metadata.json')
      if (!metadataEntry) {
        return { valid: false, error: '无法读取备份元数据' }
      }

      const metadataStr = metadataEntry.getData().toString('utf-8')
      const metadata = JSON.parse(metadataStr) as BackupMetadata

      return { valid: true, metadata }
    } catch (error: any) {
      return {
        valid: false,
        error: error?.message || '验证备份文件失败'
      }
    }
  }

  /**
   * 获取备份信息
   */
  getBackupInfo(backupPath: string): BackupMetadata | null {
    const validation = this.validateBackup(backupPath)
    if (!validation.valid || !validation.metadata) {
      return null
    }
    return validation.metadata
  }

  /**
   * 备份当前数据（恢复前先备份，防止数据丢失）
   * 简化版本，只备份数据库和文件，不包含设置
   */
  private async backupCurrentData(): Promise<string | null> {
    try {
      const userDataPath = app.getPath('userData')
      const backupDir = join(userDataPath, 'restore-backups')
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const backupPath = join(backupDir, `pre-restore-backup-${timestamp}.ibook`)

      // 使用动态导入避免循环依赖
      const { backupService } = await import('./backup')
      // 创建简化备份（不包含设置，因为此时无法从渲染进程获取）
      const result = await backupService.createBackup(backupPath, undefined)

      if (result.success) {
        return backupPath
      }
      return null
    } catch (error) {
      console.error('备份当前数据失败:', error)
      return null
    }
  }

  /**
   * 清空目录
   */
  private clearDirectory(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true })
      return
    }

    try {
      const files = readdirSync(dirPath)
      for (const file of files) {
        const filePath = join(dirPath, file)
        const stat = statSync(filePath)
        if (stat.isDirectory()) {
          rmSync(filePath, { recursive: true, force: true })
        } else {
          rmSync(filePath, { force: true })
        }
      }
    } catch (error) {
      console.error(`清空目录失败: ${dirPath}`, error)
    }
  }

  /**
   * 恢复备份
   * @param backupPath 备份文件路径（可选，如果不提供则弹出对话框）
   * @param onProgress 进度回调
   */
  async restoreBackup(
    backupPath?: string,
    onProgress?: (progress: RestoreProgress) => void
  ): Promise<{ success: boolean; backupPath?: string; error?: string }> {
    try {
      // 1. 验证备份文件
      if (onProgress) {
        onProgress({
          stage: 'validating',
          progress: 0,
          message: '正在验证备份文件...'
        })
      }

      // 如果没有提供备份路径，弹出对话框
      if (!backupPath) {
        const mainWindow = BrowserWindow.getFocusedWindow()
        const result = await dialog.showOpenDialog(mainWindow ?? BrowserWindow.getAllWindows()[0], {
          title: '选择备份文件',
          filters: [{ name: 'iBook 备份文件', extensions: ['ibook'] }],
          properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, error: '用户取消操作' }
        }

        backupPath = result.filePaths[0]
      }

      // 保存实际使用的备份路径
      const actualBackupPath = backupPath

      const validation = this.validateBackup(backupPath)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || '备份文件验证失败'
        }
      }

      // 2. 备份当前数据
      if (onProgress) {
        onProgress({
          stage: 'backing-up',
          progress: 10,
          message: '正在备份当前数据...'
        })
      }

      const currentBackupPath = await this.backupCurrentData()
      if (!currentBackupPath) {
        console.warn('警告: 无法备份当前数据，继续恢复操作')
      }

      // 3. 关闭数据库连接
      databaseService.close()

      // 4. 解压备份文件
      if (onProgress) {
        onProgress({
          stage: 'extracting',
          progress: 20,
          message: '正在解压备份文件...'
        })
      }

      const zip = new AdmZip(backupPath)
      const tempDir = join(app.getPath('temp'), 'ibook-restore-' + Date.now())
      mkdirSync(tempDir, { recursive: true })

      try {
        zip.extractAllTo(tempDir, true)

        // 5. 恢复数据库
        if (onProgress) {
          onProgress({
            stage: 'database',
            progress: 30,
            message: '正在恢复数据库...'
          })
        }

        const dbBackupPath = join(tempDir, 'database', 'ibook.db')
        if (existsSync(dbBackupPath)) {
          const dbData = readFileSync(dbBackupPath)
          writeFileSync(this.getDbPath(), dbData)
        }

        // 6. 恢复文档文件
        if (onProgress) {
          onProgress({
            stage: 'documents',
            progress: 50,
            message: '正在恢复文档文件...'
          })
        }

        const documentsBackupDir = join(tempDir, 'documents')
        const documentsDir = this.getDocumentsDir()
        if (existsSync(documentsBackupDir)) {
          this.clearDirectory(documentsDir)
          const files = readdirSync(documentsBackupDir)
          for (const file of files) {
            const sourcePath = join(documentsBackupDir, file)
            const targetPath = join(documentsDir, file)
            const fileData = readFileSync(sourcePath)
            writeFileSync(targetPath, fileData)
          }
        }

        // 7. 恢复封面文件
        if (onProgress) {
          onProgress({
            stage: 'covers',
            progress: 70,
            message: '正在恢复封面文件...'
          })
        }

        const coversBackupDir = join(tempDir, 'covers')
        const coversDir = this.getCoversDir()
        if (existsSync(coversBackupDir)) {
          this.clearDirectory(coversDir)
          const files = readdirSync(coversBackupDir)
          for (const file of files) {
            const sourcePath = join(coversBackupDir, file)
            const targetPath = join(coversDir, file)
            const fileData = readFileSync(sourcePath)
            writeFileSync(targetPath, fileData)
          }
        }

        // 8. 恢复窗口状态
        const windowStateBackupPath = join(tempDir, 'window-state.json')
        if (existsSync(windowStateBackupPath)) {
          const windowStateData = readFileSync(windowStateBackupPath)
          writeFileSync(this.getWindowStatePath(), windowStateData)
        }

        // 9. 重新初始化数据库
        databaseService.initialize()
        
        // 10. 清除所有缓存（恢复后数据已改变，缓存可能包含旧数据）
        const { cacheService } = await import('./cache')
        cacheService.clear()

        // 11. 返回设置数据（供 IPC 处理器使用）
        const settingsBackupPath = join(tempDir, 'settings.json')
        let settingsData: Record<string, any> = {}
        if (existsSync(settingsBackupPath)) {
          try {
            const settingsStr = readFileSync(settingsBackupPath, 'utf-8')
            settingsData = JSON.parse(settingsStr)
            // 移除占位符
            if (settingsData.placeholder) {
              settingsData = {}
            }
          } catch {
            settingsData = {}
          }
        }

        // 清理临时目录
        try {
          rmSync(tempDir, { recursive: true, force: true })
        } catch {
          // 忽略清理错误
        }

        if (onProgress) {
          onProgress({
            stage: 'complete',
            progress: 100,
            message: '恢复完成'
          })
        }

        // 返回结果，包含备份路径供 IPC 处理器使用
        return {
          success: true,
          backupPath: actualBackupPath,
          error: undefined
        }
      } catch (error) {
        // 清理临时目录
        try {
          rmSync(tempDir, { recursive: true, force: true })
        } catch {
          // 忽略清理错误
        }
        throw error
      }
    } catch (error: any) {
      console.error('恢复备份失败:', error)
      // 尝试重新初始化数据库
      try {
        databaseService.initialize()
      } catch {
        // 忽略初始化错误
      }
      return {
        success: false,
        error: error?.message || '恢复备份失败'
      }
    }
  }

  /**
   * 获取备份文件中的设置数据
   */
  getBackupSettings(backupPath: string): Record<string, any> {
    try {
      const zip = new AdmZip(backupPath)
      const settingsEntry = zip.getEntry('settings.json')
      if (!settingsEntry) {
        return {}
      }

      const settingsStr = settingsEntry.getData().toString('utf-8')
      const settings = JSON.parse(settingsStr)
      // 移除占位符
      if (settings.placeholder) {
        return {}
      }
      return settings
    } catch (error) {
      console.error('读取备份设置失败:', error)
      return {}
    }
  }
}

export const restoreService = new RestoreService()

