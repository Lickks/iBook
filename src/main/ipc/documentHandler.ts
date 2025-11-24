import { ipcMain, IpcMainInvokeEvent, shell } from 'electron'
import { databaseService } from '../services/database'
import type { DocumentInput } from '../../renderer/src/types/book'

/**
 * 文档相关的 IPC 处理器
 */
export function setupDocumentHandlers(): void {
  /**
   * 上传文档
   * 注意：实际的文件上传和保存逻辑将在后续阶段实现
   */
  ipcMain.handle(
    'document:upload',
    async (_event: IpcMainInvokeEvent, input: DocumentInput) => {
      try {
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

      // TODO: 后续阶段实现文件删除逻辑
      // fileManager.deleteFile(document.filePath)

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
  ipcMain.handle('document:open', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      // 使用系统默认程序打开文件
      await shell.openPath(filePath)
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
   * 注意：实际的字数统计逻辑将在后续阶段实现
   */
  ipcMain.handle('document:countWords', async (_event: IpcMainInvokeEvent, filePath: string) => {
    try {
      // TODO: 后续阶段实现字数统计逻辑
      // const wordCount = await wordCounter.countWords(filePath)
      // return { success: true, data: wordCount }
      
      return {
        success: false,
        error: '字数统计功能尚未实现'
      }
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

