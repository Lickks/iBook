import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { databaseService } from '../services/database'
import type { TagInput } from '../../renderer/src/types/book'

/**
 * 标签相关的 IPC 处理器
 */
export function setupTagHandlers(): void {
  /**
   * 创建标签
   */
  ipcMain.handle('tag:create', async (_event: IpcMainInvokeEvent, input: TagInput) => {
    try {
      const tag = databaseService.createTag(input)
      return { success: true, data: tag }
    } catch (error: any) {
      console.error('创建标签失败:', error)
      return {
        success: false,
        error: error?.message || '创建标签失败'
      }
    }
  })

  /**
   * 更新标签
   */
  ipcMain.handle(
    'tag:update',
    async (_event: IpcMainInvokeEvent, id: number, input: Partial<TagInput>) => {
      try {
        const tag = databaseService.updateTag(id, input)
        if (!tag) {
          return {
            success: false,
            error: '标签不存在'
          }
        }
        return { success: true, data: tag }
      } catch (error: any) {
        console.error('更新标签失败:', error)
        return {
          success: false,
          error: error?.message || '更新标签失败'
        }
      }
    }
  )

  /**
   * 删除标签
   */
  ipcMain.handle('tag:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const success = databaseService.deleteTag(id)
      if (!success) {
        return {
          success: false,
          error: '标签不存在'
        }
      }
      return { success: true }
    } catch (error: any) {
      console.error('删除标签失败:', error)
      return {
        success: false,
        error: error?.message || '删除标签失败'
      }
    }
  })

  /**
   * 获取所有标签
   */
  ipcMain.handle('tag:getAll', async () => {
    try {
      const tags = databaseService.getAllTags()
      return { success: true, data: tags }
    } catch (error: any) {
      console.error('获取标签列表失败:', error)
      return {
        success: false,
        error: error?.message || '获取标签列表失败'
      }
    }
  })

  /**
   * 根据 ID 获取标签
   */
  ipcMain.handle('tag:getById', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const tag = databaseService.getTagById(id)
      if (!tag) {
        return {
          success: false,
          error: '标签不存在'
        }
      }
      return { success: true, data: tag }
    } catch (error: any) {
      console.error('获取标签失败:', error)
      return {
        success: false,
        error: error?.message || '获取标签失败'
      }
    }
  })

  /**
   * 为书籍添加标签
   */
  ipcMain.handle(
    'tag:addToBook',
    async (_event: IpcMainInvokeEvent, bookId: number, tagId: number) => {
      try {
        const success = databaseService.addTagToBook(bookId, tagId)
        if (!success) {
          return {
            success: false,
            error: '添加标签失败'
          }
        }
        return { success: true }
      } catch (error: any) {
        console.error('为书籍添加标签失败:', error)
        return {
          success: false,
          error: error?.message || '为书籍添加标签失败'
        }
      }
    }
  )

  /**
   * 移除书籍标签
   */
  ipcMain.handle(
    'tag:removeFromBook',
    async (_event: IpcMainInvokeEvent, bookId: number, tagId: number) => {
      try {
        const success = databaseService.removeTagFromBook(bookId, tagId)
        if (!success) {
          return {
            success: false,
            error: '移除标签失败'
          }
        }
        return { success: true }
      } catch (error: any) {
        console.error('移除书籍标签失败:', error)
        return {
          success: false,
          error: error?.message || '移除书籍标签失败'
        }
      }
    }
  )

  /**
   * 获取书籍的所有标签
   */
  ipcMain.handle('tag:getByBookId', async (_event: IpcMainInvokeEvent, bookId: number) => {
    try {
      const tags = databaseService.getTagsByBookId(bookId)
      return { success: true, data: tags }
    } catch (error: any) {
      console.error('获取书籍标签失败:', error)
      return {
        success: false,
        error: error?.message || '获取书籍标签失败'
      }
    }
  })

  /**
   * 批量为书籍添加标签
   */
  ipcMain.handle(
    'tag:batchAddToBooks',
    async (_event: IpcMainInvokeEvent, bookIds: number[], tagId: number) => {
      try {
        const count = databaseService.batchAddTagToBooks(bookIds, tagId)
        return { success: true, data: count }
      } catch (error: any) {
        console.error('批量添加标签失败:', error)
        return {
          success: false,
          error: error?.message || '批量添加标签失败'
        }
      }
    }
  )

  /**
   * 获取标签使用统计
   */
  ipcMain.handle('tag:getUsageCount', async (_event: IpcMainInvokeEvent, tagId: number) => {
    try {
      const count = databaseService.getTagUsageCount(tagId)
      return { success: true, data: count }
    } catch (error: any) {
      console.error('获取标签使用统计失败:', error)
      return {
        success: false,
        error: error?.message || '获取标签使用统计失败'
      }
    }
  })
}

