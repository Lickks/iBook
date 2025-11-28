import { app, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync, statSync, readdirSync } from 'fs'
import AdmZip from 'adm-zip'
import { databaseService } from './database'
// import fileManager from './fileManager'
// import { coverService } from './cover'

export interface BackupMetadata {
  version: string
  appVersion: string
  backupTime: string
  dataStats: {
    books: number
    documents: number
    covers: number
    tags: number
    bookshelves: number
  }
  fileSize: number
}

export interface BackupProgress {
  stage: 'preparing' | 'database' | 'documents' | 'covers' | 'settings' | 'compressing' | 'complete'
  progress: number
  message: string
}

/**
 * 备份服务
 * 负责创建数据备份
 */
class BackupService {
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
   * 获取数据统计
   */
  private getDataStats(): BackupMetadata['dataStats'] {
    const db = databaseService.getDatabase()

    const booksCount = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number }
    const documentsCount = db.prepare('SELECT COUNT(*) as count FROM documents').get() as {
      count: number
    }
    const tagsCount = db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number }
    const bookshelvesCount = db
      .prepare('SELECT COUNT(*) as count FROM bookshelves')
      .get() as { count: number }

    // 统计封面文件数量
    let coversCount = 0
    const coversDir = this.getCoversDir()
    if (existsSync(coversDir)) {
      try {
        const files = readdirSync(coversDir)
        coversCount = files.filter((f) => {
          const ext = f.toLowerCase()
          return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')
        }).length
      } catch {
        coversCount = 0
      }
    }

    return {
      books: booksCount.count,
      documents: documentsCount.count,
      covers: coversCount,
      tags: tagsCount.count,
      bookshelves: bookshelvesCount.count
    }
  }

  /**
   * 递归添加目录到 zip
   */
  private addDirectoryToZip(
    zip: AdmZip,
    dirPath: string,
    zipPath: string,
    onProgress?: (progress: number) => void
  ): void {
    if (!existsSync(dirPath)) {
      return
    }

    const files = readdirSync(dirPath)
    let processed = 0

    for (const file of files) {
      const filePath = join(dirPath, file)
      const fileZipPath = join(zipPath, file).replace(/\\/g, '/')

      try {
        const stat = statSync(filePath)
        if (stat.isDirectory()) {
          this.addDirectoryToZip(zip, filePath, fileZipPath, onProgress)
        } else {
          const fileData = readFileSync(filePath)
          zip.addFile(fileZipPath, fileData)
        }

        processed++
        if (onProgress) {
          onProgress((processed / files.length) * 100)
        }
      } catch (error) {
        console.error(`添加文件到备份失败: ${filePath}`, error)
      }
    }
  }

  /**
   * 创建备份
   * @param savePath 保存路径（可选，如果不提供则弹出对话框）
   * @param onProgress 进度回调
   */
  async createBackup(
    savePath?: string,
    onProgress?: (progress: BackupProgress) => void
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      // 1. 准备阶段
      if (onProgress) {
        onProgress({
          stage: 'preparing',
          progress: 0,
          message: '正在准备备份...'
        })
      }

      // 如果没有提供保存路径，弹出对话框
      if (!savePath) {
        const mainWindow = BrowserWindow.getFocusedWindow()
        const result = await dialog.showSaveDialog(mainWindow ?? BrowserWindow.getAllWindows()[0], {
          title: '保存备份文件',
          defaultPath: `ibook-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.ibook`,
          filters: [{ name: 'iBook 备份文件', extensions: ['ibook'] }]
        })

        if (result.canceled || !result.filePath) {
          return { success: false, error: '用户取消操作' }
        }

        savePath = result.filePath
      }

      const zip = new AdmZip()
      // const userDataPath = app.getPath('userData')

      // 2. 备份数据库
      if (onProgress) {
        onProgress({
          stage: 'database',
          progress: 10,
          message: '正在备份数据库...'
        })
      }

      const dbPath = this.getDbPath()
      if (existsSync(dbPath)) {
        const dbData = readFileSync(dbPath)
        zip.addFile('database/ibook.db', dbData)
      }

      // 3. 备份文档文件
      if (onProgress) {
        onProgress({
          stage: 'documents',
          progress: 30,
          message: '正在备份文档文件...'
        })
      }

      const documentsDir = this.getDocumentsDir()
      if (existsSync(documentsDir)) {
        this.addDirectoryToZip(zip, documentsDir, 'documents', (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'documents',
              progress: 30 + (progress * 20) / 100,
              message: `正在备份文档文件... ${Math.round(progress)}%`
            })
          }
        })
      }

      // 4. 备份封面文件
      if (onProgress) {
        onProgress({
          stage: 'covers',
          progress: 50,
          message: '正在备份封面文件...'
        })
      }

      const coversDir = this.getCoversDir()
      if (existsSync(coversDir)) {
        this.addDirectoryToZip(zip, coversDir, 'covers', (progress) => {
          if (onProgress) {
            onProgress({
              stage: 'covers',
              progress: 50 + (progress * 15) / 100,
              message: `正在备份封面文件... ${Math.round(progress)}%`
            })
          }
        })
      }

      // 5. 备份用户设置（需要从渲染进程获取，这里先创建占位文件）
      if (onProgress) {
        onProgress({
          stage: 'settings',
          progress: 65,
          message: '正在备份用户设置...'
        })
      }

      // 设置文件将在 IPC 处理器中从渲染进程获取后添加
      const settingsPlaceholder = JSON.stringify({ placeholder: true })
      zip.addFile('settings.json', Buffer.from(settingsPlaceholder, 'utf-8'))

      // 6. 备份窗口状态
      const windowStatePath = this.getWindowStatePath()
      if (existsSync(windowStatePath)) {
        const windowStateData = readFileSync(windowStatePath)
        zip.addFile('window-state.json', windowStateData)
      }

      // 7. 生成元数据
      const dataStats = this.getDataStats()
      const metadata: BackupMetadata = {
        version: '1.0.0',
        appVersion: app.getVersion(),
        backupTime: new Date().toISOString(),
        dataStats,
        fileSize: 0 // 将在压缩后更新
      }

      // 8. 压缩文件
      if (onProgress) {
        onProgress({
          stage: 'compressing',
          progress: 80,
          message: '正在压缩备份文件...'
        })
      }

      zip.addFile('metadata.json', Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8'))
      zip.writeZip(savePath)

      // 更新文件大小
      const finalStats = statSync(savePath)
      metadata.fileSize = finalStats.size

      // 更新元数据
      const finalZip = new AdmZip(savePath)
      finalZip.updateFile('metadata.json', Buffer.from(JSON.stringify(metadata, null, 2), 'utf-8'))
      finalZip.writeZip(savePath)

      if (onProgress) {
        onProgress({
          stage: 'complete',
          progress: 100,
          message: '备份完成'
        })
      }

      return { success: true, path: savePath }
    } catch (error: any) {
      console.error('创建备份失败:', error)
      return {
        success: false,
        error: error?.message || '创建备份失败'
      }
    }
  }

  /**
   * 更新备份文件中的设置
   * 在 IPC 处理器中调用，用于添加从渲染进程获取的 localStorage 数据
   */
  updateBackupSettings(backupPath: string, settings: Record<string, any>): void {
    try {
      const zip = new AdmZip(backupPath)
      zip.updateFile('settings.json', Buffer.from(JSON.stringify(settings, null, 2), 'utf-8'))
      zip.writeZip(backupPath)
    } catch (error) {
      console.error('更新备份设置失败:', error)
      throw error
    }
  }
}

export const backupService = new BackupService()

