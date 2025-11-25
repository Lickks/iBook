import { ipcMain, IpcMainInvokeEvent } from 'electron'
import { databaseService } from '../services/database'
import type { BookInput, BookFilters, BookSort } from '../../renderer/src/types/book'

/**
 * 书籍相关的 IPC 处理器
 */
export function setupBookHandlers(): void {
  /**
   * 创建书籍
   */
  ipcMain.handle('book:create', async (_event: IpcMainInvokeEvent, input: BookInput) => {
    try {
      const book = databaseService.createBook(input)
      return { success: true, data: book }
    } catch (error: any) {
      console.error('创建书籍失败:', error)
      return {
        success: false,
        error: error?.message || '创建书籍失败'
      }
    }
  })

  /**
   * 更新书籍
   */
  ipcMain.handle(
    'book:update',
    async (_event: IpcMainInvokeEvent, id: number, input: Partial<BookInput>) => {
      try {
        const book = databaseService.updateBook(id, input)
        if (!book) {
          return {
            success: false,
            error: '书籍不存在'
          }
        }
        return { success: true, data: book }
      } catch (error: any) {
        console.error('更新书籍失败:', error)
        return {
          success: false,
          error: error?.message || '更新书籍失败'
        }
      }
    }
  )

  /**
   * 删除书籍
   */
  ipcMain.handle('book:delete', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const success = databaseService.deleteBook(id)
      if (!success) {
        return {
          success: false,
          error: '书籍不存在'
        }
      }
      return { success: true }
    } catch (error: any) {
      console.error('删除书籍失败:', error)
      return {
        success: false,
        error: error?.message || '删除书籍失败'
      }
    }
  })

  /**
   * 批量删除书籍
   */
  ipcMain.handle('book:deleteBatch', async (_event: IpcMainInvokeEvent, ids: number[]) => {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: false,
          error: '请选择要删除的书籍'
        }
      }
      const count = databaseService.deleteBooks(ids)
      return { success: true, data: count }
    } catch (error: any) {
      console.error('批量删除书籍失败:', error)
      return {
        success: false,
        error: error?.message || '批量删除书籍失败'
      }
    }
  })

  
  /**
   * 根据 ID 获取书籍
   */
  ipcMain.handle('book:getById', async (_event: IpcMainInvokeEvent, id: number) => {
    try {
      const book = databaseService.getBookById(id)
      if (!book) {
        return {
          success: false,
          error: '书籍不存在'
        }
      }
      return { success: true, data: book }
    } catch (error: any) {
      console.error('获取书籍失败:', error)
      return {
        success: false,
        error: error?.message || '获取书籍失败'
      }
    }
  })

  /**
   * 获取所有书籍
   */
  ipcMain.handle('book:getAll', async () => {
    try {
      const books = databaseService.getAllBooks()
      return { success: true, data: books }
    } catch (error: any) {
      console.error('获取书籍列表失败:', error)
      return {
        success: false,
        error: error?.message || '获取书籍列表失败'
      }
    }
  })

  /**
   * 搜索书籍
   */
  ipcMain.handle('book:search', async (_event: IpcMainInvokeEvent, keyword: string) => {
    try {
      if (!keyword || keyword.trim().length === 0) {
        return { success: true, data: [] }
      }
      const books = databaseService.searchBooks(keyword.trim())
      return { success: true, data: books }
    } catch (error: any) {
      console.error('搜索书籍失败:', error)
      return {
        success: false,
        error: error?.message || '搜索书籍失败'
      }
    }
  })

  /**
   * 分页查询书籍
   */
  ipcMain.handle(
    'book:getPaginated',
    async (
      _event: IpcMainInvokeEvent,
      page: number,
      pageSize: number,
      filters?: BookFilters,
      sort?: BookSort
    ) => {
      try {
        const result = databaseService.getBooksPaginated(page, pageSize, filters, sort)
        return { success: true, data: result }
      } catch (error: any) {
        console.error('分页查询书籍失败:', error)
        return {
          success: false,
          error: error?.message || '分页查询书籍失败'
        }
      }
    }
  )
}

