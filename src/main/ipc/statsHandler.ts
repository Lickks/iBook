/**
 * 统计数据 IPC 处理器
 * 处理前端发送的统计数据请求
 */

import { ipcMain } from 'electron'
import { databaseService } from '../services/database'

// 统计数据接口定义
interface ChartData {
  name: string
  value: number
  percentage?: number
}

interface MonthlyData {
  month: string
  bookCount: number
  wordCount: number
}

interface StatisticsData {
  totalBooks: number
  totalWordCount: number
  averageRating: number
  finishedBooks: number
  readingBooks: number
  unreadBooks: number
  categoryStats: ChartData[]
  platformStats: ChartData[]
  statusStats: ChartData[]
  wordCountStats: ChartData[]
  monthlyStats: {
    books: MonthlyData[]
    words: MonthlyData[]
  }
}

/**
 * 注册统计相关的 IPC 处理器
 */
export function registerStatsHandlers(): void {

  /**
   * 获取总体统计数据
   */
  ipcMain.handle('stats:getOverview', async (_, bookshelfId?: number | null) => {
    try {
      const books = bookshelfId !== null && bookshelfId !== undefined
        ? databaseService.getBooksInBookshelf(bookshelfId)
        : databaseService.getAllBooks()

      // 计算总体统计
      const totalBooks = books.length
      const totalWordCount = books.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0)
      const finishedBooks = books.filter(book => book.readingStatus === 'finished').length
      const readingBooks = books.filter(book => book.readingStatus === 'reading').length
      const unreadBooks = books.filter(book => book.readingStatus === 'unread').length

      // 计算平均评分
      const booksWithRating = books.filter(book => book.personalRating && book.personalRating > 0)
      const averageRating = booksWithRating.length > 0
        ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length
        : 0

      // 分类统计
      const categoryMap = new Map<string, number>()
      books.forEach(book => {
        const category = book.category || '未分类'
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })
      const categoryStats: ChartData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalBooks > 0 ? Math.round((value / totalBooks) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)

      // 平台统计
      const platformMap = new Map<string, number>()
      books.forEach(book => {
        const platform = book.platform || '未知平台'
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1)
      })
      const platformStats: ChartData[] = Array.from(platformMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalBooks > 0 ? Math.round((value / totalBooks) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)

      // 阅读状态统计
      const statusMap = new Map<string, number>()
      const statusNames = ['unread', 'reading', 'finished', 'dropped', 'to-read']
      const statusLabels = {
        'unread': '未读',
        'reading': '阅读中',
        'finished': '已读完',
        'dropped': '弃读',
        'to-read': '待读'
      }
      statusNames.forEach(status => {
        statusMap.set(statusLabels[status as keyof typeof statusLabels], 0)
      })
      books.forEach(book => {
        const status = statusLabels[book.readingStatus] || '未读'
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
      })
      const statusStats: ChartData[] = Array.from(statusMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalBooks > 0 ? Math.round((value / totalBooks) * 100) : 0
        }))
        .filter(item => item.value > 0)

      // 字数分布统计
      const wordCountRanges = [
        { name: '0-50万', min: 0, max: 500000, count: 0 },
        { name: '50-100万', min: 500000, max: 1000000, count: 0 },
        { name: '100-300万', min: 1000000, max: 3000000, count: 0 },
        { name: '300-500万', min: 3000000, max: 5000000, count: 0 },
        { name: '500-1000万', min: 5000000, max: 10000000, count: 0 },
        { name: '1000万以上', min: 10000000, max: Infinity, count: 0 }
      ]

      books.forEach(book => {
        const wordCount = book.wordCountDisplay || 0
        const range = wordCountRanges.find(r => wordCount >= r.min && wordCount < r.max)
        if (range) {
          range.count++
        }
      })

      const wordCountStats: ChartData[] = wordCountRanges
        .filter(range => range.count > 0)
        .map(range => ({
          name: range.name,
          value: range.count,
          percentage: totalBooks > 0 ? Math.round((range.count / totalBooks) * 100) : 0
        }))

      // 月度统计（最近12个月）
      const monthlyStats = getMonthlyStats(books, 12)

      const result: StatisticsData = {
        totalBooks,
        totalWordCount,
        averageRating: Math.round(averageRating * 10) / 10,
        finishedBooks,
        readingBooks,
        unreadBooks,
        categoryStats,
        platformStats,
        statusStats,
        wordCountStats,
        monthlyStats
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计数据失败'
      }
    }
  })

  /**
   * 获取分类统计数据
   */
  ipcMain.handle('stats:getCategoryStats', async (_, bookshelfId?: number | null) => {
    try {
      const books = bookshelfId !== null && bookshelfId !== undefined
        ? databaseService.getBooksInBookshelf(bookshelfId)
        : databaseService.getAllBooks()
      const categoryMap = new Map<string, number>()

      books.forEach(book => {
        const category = book.category || '未分类'
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      })

      const total = books.length
      const result: ChartData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取分类统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取分类统计失败'
      }
    }
  })

  /**
   * 获取平台统计数据
   */
  ipcMain.handle('stats:getPlatformStats', async (_, bookshelfId?: number | null) => {
    try {
      const books = bookshelfId !== null && bookshelfId !== undefined
        ? databaseService.getBooksInBookshelf(bookshelfId)
        : databaseService.getAllBooks()
      const platformMap = new Map<string, number>()

      books.forEach(book => {
        const platform = book.platform || '未知平台'
        platformMap.set(platform, (platformMap.get(platform) || 0) + 1)
      })

      const total = books.length
      const result: ChartData[] = Array.from(platformMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }))
        .sort((a, b) => b.value - a.value)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取平台统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取平台统计失败'
      }
    }
  })

  /**
   * 获取阅读状态统计数据
   */
  ipcMain.handle('stats:getStatusStats', async (_, bookshelfId?: number | null) => {
    try {
      const books = bookshelfId !== null && bookshelfId !== undefined
        ? databaseService.getBooksInBookshelf(bookshelfId)
        : databaseService.getAllBooks()
      const statusMap = new Map<string, number>()
      const statusNames = ['未读', '阅读中', '已读完', '弃读', '待读']

      statusNames.forEach(status => {
        statusMap.set(status, 0)
      })

      books.forEach(book => {
        const status = book.readingStatus || '未读'
        statusMap.set(status, (statusMap.get(status) || 0) + 1)
      })

      const total = books.length
      const result: ChartData[] = Array.from(statusMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? Math.round((value / total) * 100) : 0
        }))
        .filter(item => item.value > 0)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取状态统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取状态统计失败'
      }
    }
  })

  /**
   * 获取月度统计数据
   */
  ipcMain.handle('stats:getMonthlyStats', async (_, months: number = 12, bookshelfId?: number | null) => {
    try {
      const books = bookshelfId !== null && bookshelfId !== undefined
        ? databaseService.getBooksInBookshelf(bookshelfId)
        : databaseService.getAllBooks()
      const result = getMonthlyStats(books, months)

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取月度统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取月度统计失败'
      }
    }
  })

  
  /**
   * 获取指定年份的统计数据
   */
  ipcMain.handle('stats:getYearlyStats', async (_, year: number) => {
    try {
      const books = databaseService.getAllBooks()
      const yearBooks = books.filter(book => {
        if (!book.createdAt) return false
        return new Date(book.createdAt).getFullYear() === year
      })

      // 重新计算该年份的统计数据
      const totalBooks = yearBooks.length
      const totalWordCount = yearBooks.reduce((sum, book) => sum + (book.wordCountDisplay || 0), 0)
      const finishedBooks = yearBooks.filter(book => book.readingStatus === 'finished').length
      const readingBooks = yearBooks.filter(book => book.readingStatus === 'reading').length
      const unreadBooks = yearBooks.filter(book => book.readingStatus === 'unread').length

      const booksWithRating = yearBooks.filter(book => book.personalRating && book.personalRating > 0)
      const averageRating = booksWithRating.length > 0
        ? booksWithRating.reduce((sum, book) => sum + (book.personalRating || 0), 0) / booksWithRating.length
        : 0

      const result = {
        totalBooks,
        totalWordCount,
        averageRating: Math.round(averageRating * 10) / 10,
        finishedBooks,
        readingBooks,
        unreadBooks,
        categoryStats: [], // 简化处理，可以按需扩展
        platformStats: [],
        statusStats: [],
        monthlyStats: getMonthlyStats(yearBooks, 12)
      }

      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('获取年度统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取年度统计失败'
      }
    }
  })

  /**
   * 重新计算统计数据
   */
  ipcMain.handle('stats:recalculateStats', async () => {
    try {
      // 这里可以添加一些统计数据的重新计算逻辑
      // 例如：缓存清理、索引重建等
      return {
        success: true,
        data: true
      }
    } catch (error) {
      console.error('重新计算统计失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新计算统计失败'
      }
    }
  })
}

/**
 * 计算月度统计数据的辅助函数
 */
function getMonthlyStats(books: any[], months: number = 12) {
  const monthlyData: { [key: string]: { bookCount: number, wordCount: number } } = {}
  const now = new Date()

  // 初始化最近几个月的数据
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyData[monthKey] = { bookCount: 0, wordCount: 0 }
  }

  // 统计每月数据
  books.forEach(book => {
    if (book.createdAt) {
      const date = new Date(book.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].bookCount++
        monthlyData[monthKey].wordCount += book.wordCountDisplay || 0
      }
    }
  })

  // 转换为数组格式
  const booksData: MonthlyData[] = Object.entries(monthlyData).map(([month, data]) => ({
    month: formatMonth(month),
    bookCount: data.bookCount,
    wordCount: data.wordCount
  }))

  const wordsData: MonthlyData[] = Object.entries(monthlyData).map(([month, data]) => ({
    month: formatMonth(month),
    bookCount: data.bookCount,
    wordCount: data.wordCount
  }))

  return {
    books: booksData,
    words: wordsData
  }
}

/**
 * 格式化月份显示
 */
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  return `${year}年${parseInt(month)}月`
}