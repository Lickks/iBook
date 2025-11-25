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
   * 复用单本删除接口，逐个删除以确保数据一致性
   */
  ipcMain.handle('book:deleteBatch', async (_event: IpcMainInvokeEvent, ids: number[]) => {
    try {
      // 确保参数是可序列化的纯数组
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return {
          success: false,
          error: '请选择要删除的书籍'
        }
      }
      
      // 创建新的纯数组，确保所有元素都是可序列化的数字
      const validIds: number[] = []
      for (const id of ids) {
        // 确保是数字类型且是整数
        const numId = typeof id === 'number' ? id : Number(id)
        if (Number.isInteger(numId) && numId > 0 && !isNaN(numId)) {
          validIds.push(numId)
        }
      }
      
      if (validIds.length === 0) {
        return {
          success: false,
          error: '无效的书籍ID'
        }
      }
      
      // 如果有效ID数量少于原始ID数量，记录警告
      if (validIds.length < ids.length) {
        console.warn(`批量删除书籍: 原始ID数量 ${ids.length}，有效ID数量 ${validIds.length}，已过滤无效ID`)
      }
      
      // 复用单本删除接口，逐个删除
      let successCount = 0
      const failedIds: number[] = []
      
      console.log(`开始批量删除书籍，共 ${validIds.length} 本`)
      
      for (const id of validIds) {
        try {
          // 直接调用单本删除方法，复用其逻辑（包括缓存清理等）
          const deleteResult = databaseService.deleteBook(id)
          if (deleteResult) {
            successCount++
          } else {
            // 书籍不存在或已被删除，记录但不视为错误
            failedIds.push(id)
          }
        } catch (error: any) {
          // 单个删除失败不影响其他删除操作
          failedIds.push(id)
          // 确保错误信息是可序列化的字符串
          const errorMsg = typeof error?.message === 'string' 
            ? error.message 
            : typeof error === 'string' 
              ? error 
              : '未知错误'
          console.error(`删除书籍 ID ${id} 失败: ${errorMsg}`)
        }
      }
      
      console.log(`批量删除完成: 成功 ${successCount} 本，失败 ${failedIds.length} 本`)
      
      // 如果所有删除都失败，返回错误
      if (successCount === 0) {
        const errorMsg = failedIds.length === validIds.length 
          ? `所有书籍删除失败，可能书籍不存在或已被删除`
          : `没有成功删除任何书籍`
        return {
          success: false,
          error: errorMsg
        }
      }
      
      // 如果有部分删除失败，记录警告但不影响整体成功
      if (failedIds.length > 0) {
        console.warn(`批量删除书籍: 部分失败，成功 ${successCount} 本，失败 ${failedIds.length} 本`)
      }
      
      // 至少成功删除了一本，返回成功
      // 确保返回的数据是完全可序列化的基本类型
      const result = {
        success: true as const,
        data: successCount
      }
      
      // 验证返回值可序列化
      try {
        JSON.stringify(result)
      } catch (e) {
        console.error('返回值序列化失败:', e)
        return {
          success: false,
          error: '返回值序列化失败'
        }
      }
      
      return result
    } catch (error: any) {
      // 捕获所有未预期的异常（如数据库连接问题等）
      // 确保错误信息是可序列化的字符串
      let errorMessage = '批量删除书籍失败'
      try {
        if (typeof error?.message === 'string') {
          errorMessage = error.message
        } else if (typeof error === 'string') {
          errorMessage = error
        }
      } catch (e) {
        // 忽略错误信息提取失败
      }
      
      console.error('批量删除书籍时发生未预期的异常:', errorMessage)
      
      // 确保返回值是完全可序列化的
      const result = {
        success: false as const,
        error: `批量删除书籍失败: ${errorMessage}`
      }
      
      // 验证返回值可序列化
      try {
        JSON.stringify(result)
        return result
      } catch (e) {
        // 如果序列化失败，返回最简单的错误信息
        return {
          success: false,
          error: '批量删除书籍失败'
        }
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

