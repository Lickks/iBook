import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { databaseService } from '../services/database'
import type { BookshelfInput, BookFilters } from '../../renderer/src/types'

/**
 * 书架相关的 IPC 处理器
 */
export function setupBookshelfHandlers(): void {
  /**
   * 创建书架
   */
  ipcMain.handle('bookshelf:create', async (_event: IpcMainInvokeEvent, name: string, description?: string) => {
    try {
      const bookshelf = databaseService.createBookshelf(name, description)
      return { success: true, data: bookshelf }
    } catch (error: any) {
      console.error('创建书架失败:', error)
      return {
        success: false,
        error: error?.message || '创建书架失败'
      }
    }
  })

  /**
   * 获取所有书架
   */
  ipcMain.handle('bookshelf:getAll', async () => {
    try {
      const bookshelves = databaseService.getAllBookshelves()
      return { success: true, data: bookshelves }
    } catch (error: any) {
      console.error('获取书架列表失败:', error)
      return {
        success: false,
        error: error?.message || '获取书架列表失败'
      }
    }
  })

  /**
   * 根据 ID 获取书架
   */
  ipcMain.handle('bookshelf:getById', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const bookshelf = databaseService.getBookshelfById(id)
      if (!bookshelf) {
        return {
          success: false,
          error: '书架不存在'
        }
      }
      return { success: true, data: bookshelf }
    } catch (error: any) {
      console.error('获取书架失败:', error)
      return {
        success: false,
        error: error?.message || '获取书架失败'
      }
    }
  })

  /**
   * 更新书架
   */
  ipcMain.handle(
    'bookshelf:update',
    async (_event: IpcMainInvokeEvent, id: number, input: Partial<BookshelfInput>) => {
      try {
        const bookshelf = databaseService.updateBookshelf(id, input)
        if (!bookshelf) {
          return {
            success: false,
            error: '书架不存在'
          }
        }
        return { success: true, data: bookshelf }
      } catch (error: any) {
        console.error('更新书架失败:', error)
        return {
          success: false,
          error: error?.message || '更新书架失败'
        }
      }
    }
  )

  /**
   * 删除书架
   */
  ipcMain.handle('bookshelf:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const success = databaseService.deleteBookshelf(id)
      if (!success) {
        return {
          success: false,
          error: '书架不存在或删除失败'
        }
      }
      return { success: true }
    } catch (error: any) {
      console.error('删除书架失败:', error)
      return {
        success: false,
        error: error?.message || '删除书架失败'
      }
    }
  })

  /**
   * 添加书籍到书架
   */
  ipcMain.handle(
    'bookshelf:addBooks',
    async (_event: IpcMainInvokeEvent, bookshelfId: number, bookIds: number[]) => {
      try {
        // 确保 bookIds 是纯数组，避免序列化问题
        const ids = Array.isArray(bookIds) ? [...bookIds] : []
        const count = databaseService.addBooksToBookshelf(bookshelfId, ids)
        // 确保返回值是完全可序列化的
        return { success: true, data: { count: Number(count) } }
      } catch (error: any) {
        console.error('添加书籍到书架失败:', error)
        return {
          success: false,
          error: error?.message || '添加书籍到书架失败'
        }
      }
    }
  )

  /**
   * 从书架移除书籍
   */
  ipcMain.handle(
    'bookshelf:removeBooks',
    async (_event: IpcMainInvokeEvent, bookshelfId: number, bookIds: number[]) => {
      try {
        // 确保 bookIds 是纯数组，避免序列化问题
        const ids = Array.isArray(bookIds) ? [...bookIds] : []
        const count = databaseService.removeBooksFromBookshelf(bookshelfId, ids)
        // 确保返回值是完全可序列化的
        return { success: true, data: { count: Number(count) } }
      } catch (error: any) {
        console.error('从书架移除书籍失败:', error)
        return {
          success: false,
          error: error?.message || '从书架移除书籍失败'
        }
      }
    }
  )

  /**
   * 获取书架中的书籍
   */
  ipcMain.handle(
    'bookshelf:getBooks',
    async (_event: IpcMainInvokeEvent, bookshelfId: number | null, filters?: BookFilters) => {
      try {
        const books = databaseService.getBooksInBookshelf(bookshelfId, filters)
        return { success: true, data: books }
      } catch (error: any) {
        console.error('获取书架书籍失败:', error)
        return {
          success: false,
          error: error?.message || '获取书架书籍失败'
        }
      }
    }
  )

  /**
   * 获取书架统计信息
   */
  ipcMain.handle('bookshelf:getStats', async (_event: IpcMainInvokeEvent, bookshelfId: number) => {
    try {
      const stats = databaseService.getBookshelfStats(bookshelfId)
      return { success: true, data: stats }
    } catch (error: any) {
      console.error('获取书架统计失败:', error)
      return {
        success: false,
        error: error?.message || '获取书架统计失败'
      }
    }
  })

  /**
   * 获取书籍所属的书架列表
   */
  ipcMain.handle('bookshelf:getByBookId', async (_event: IpcMainInvokeEvent, bookId: number) => {
    try {
      const bookshelves = databaseService.getBookshelvesByBookId(bookId)
      return { success: true, data: bookshelves }
    } catch (error: any) {
      console.error('获取书籍所属书架失败:', error)
      return {
        success: false,
        error: error?.message || '获取书籍所属书架失败'
      }
    }
  })
}

