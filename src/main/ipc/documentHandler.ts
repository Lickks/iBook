import { ipcMain, IpcMainInvokeEvent, dialog } from 'electron'
import { databaseService } from '../services/database'
import fileManager from '../services/fileManager'
import wordCounter from '../services/wordCounter'
import type { DocumentInput } from '../../renderer/src/types/book'

/**
 * 文档相关的 IPC 处理器
 */
export function setupDocumentHandlers(): void {
  /**
   * 上传文档（选择文件）
   */
  ipcMain.handle('document:selectFile', async (_event: IpcMainInvokeEvent) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: '文档文件', extensions: ['txt', 'epub', 'pdf', 'docx', 'doc'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: '未选择文件' }
      }

      return { success: true, data: result.filePaths[0] }
    } catch (error: any) {
      console.error('选择文件失败:', error)
      return {
        success: false,
        error: error?.message || '选择文件失败'
      }
    }
  })

  /**
   * 批量选择文件
   */
  ipcMain.handle('document:selectFiles', async (_event: IpcMainInvokeEvent) => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: '文档文件', extensions: ['txt', 'epub', 'pdf', 'mobi', 'azw', 'azw3', 'docx', 'doc'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: '未选择文件' }
      }

      return { success: true, data: result.filePaths }
    } catch (error: any) {
      console.error('选择文件失败:', error)
      return {
        success: false,
        error: error?.message || '选择文件失败'
      }
    }
  })

  /**
   * 上传文档（保存文件并创建记录）
   */
  ipcMain.handle(
    'document:upload',
    async (_event: IpcMainInvokeEvent, filePath: string, bookId: number) => {
      try {
        // 保存文件
        const fileName = await fileManager.saveFile(filePath, bookId)

        // 获取文件大小
        const fileSize = fileManager.getFileSize(fileName)

        // 统计字数
        let wordCount = 0
        try {
          const savedFilePath = fileManager.getFilePath(fileName)
          wordCount = await wordCounter.countWords(savedFilePath)
        } catch (error) {
          console.warn('字数统计失败，使用默认值 0:', error)
        }

        // 创建文档记录
        const input: DocumentInput = {
          bookId,
          fileName,
          filePath: fileName,
          fileType: fileName.split('.').pop() || '',
          fileSize,
          wordCount
        }

        const document = databaseService.createDocument(input)
        return { success: true, data: document }
      } catch (error: any) {
        console.error('上传文档失败:', error)
        return {
          success: false,
          error: error?.message || '上传文档失败'
        }
      }
    }
  )

  /**
   * 删除文档
   */
  ipcMain.handle('document:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      // 先获取文档信息，以便后续删除文件
      const document = databaseService.getDocumentById(id)
      if (!document) {
        return {
          success: false,
          error: '文档不存在'
        }
      }

      // 删除数据库记录
      const success = databaseService.deleteDocument(id)
      if (!success) {
        return {
          success: false,
          error: '删除文档失败'
        }
      }

      // 删除文件
      try {
        await fileManager.deleteFile(document.filePath)
      } catch (error) {
        console.warn('删除文件失败（数据库记录已删除）:', error)
      }

      return { success: true }
    } catch (error: any) {
      console.error('删除文档失败:', error)
      return {
        success: false,
        error: error?.message || '删除文档失败'
      }
    }
  })

  /**
   * 打开文档
   */
  ipcMain.handle('document:open', async (_event: IpcMainInvokeEvent, fileName: string) => {
    try {
      await fileManager.openFile(fileName)
      return { success: true }
    } catch (error: any) {
      console.error('打开文档失败:', error)
      return {
        success: false,
        error: error?.message || '打开文档失败'
      }
    }
  })

  /**
   * 统计文档字数
   */
  ipcMain.handle('document:countWords', async (_event: IpcMainInvokeEvent, fileName: string) => {
    try {
      const filePath = fileManager.getFilePath(fileName)
      const wordCount = await wordCounter.countWords(filePath)
      return { success: true, data: wordCount }
    } catch (error: any) {
      console.error('统计字数失败:', error)
      return {
        success: false,
        error: error?.message || '统计字数失败'
      }
    }
  })

  /**
   * 根据书籍 ID 获取所有文档
   */
  ipcMain.handle(
    'document:getByBookId',
    async (_event: IpcMainInvokeEvent, bookId: number) => {
      try {
        const documents = databaseService.getDocumentsByBookId(bookId)
        return { success: true, data: documents }
      } catch (error: any) {
        console.error('获取文档列表失败:', error)
        return {
          success: false,
          error: error?.message || '获取文档列表失败'
        }
      }
    }
  )

  /**
   * 更新文档
   */
  ipcMain.handle(
    'document:update',
    async (_event: IpcMainInvokeEvent, id: number, input: Partial<DocumentInput>) => {
      try {
        const document = databaseService.updateDocument(id, input)
        if (!document) {
          return {
            success: false,
            error: '文档不存在'
          }
        }
        return { success: true, data: document }
      } catch (error: any) {
        console.error('更新文档失败:', error)
        return {
          success: false,
          error: error?.message || '更新文档失败'
        }
      }
    }
  )
}

