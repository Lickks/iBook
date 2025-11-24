import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBookStore } from './book'

/**
 * 统计数据管理 Store
 */
export const useStatsStore = defineStore('stats', () => {
  const bookStore = useBookStore()

  // Getters - 基于 bookStore 计算统计数据
  const totalBooks = computed(() => bookStore.books.length)

  const totalWordCount = computed(() => bookStore.totalWordCount)

  const finishedBooks = computed(() => {
    return bookStore.books.filter((book) => book.readingStatus === 'finished').length
  })

  const readingBooks = computed(() => {
    return bookStore.books.filter((book) => book.readingStatus === 'reading').length
  })

  const unreadBooks = computed(() => {
    return bookStore.books.filter((book) => book.readingStatus === 'unread').length
  })

  const averageRating = computed(() => {
    const ratedBooks = bookStore.books.filter((book) => book.personalRating !== undefined)
    if (ratedBooks.length === 0) {
      return 0
    }
    const sum = ratedBooks.reduce((sum, book) => sum + (book.personalRating || 0), 0)
    return sum / ratedBooks.length
  })

  // 按类型统计
  const categoryStats = computed(() => {
    const categoryMap: Record<string, { count: number; totalWords: number }> = {}
    bookStore.books.forEach((book) => {
      const category = book.category || '未分类'
      if (!categoryMap[category]) {
        categoryMap[category] = { count: 0, totalWords: 0 }
      }
      categoryMap[category].count++
      categoryMap[category].totalWords += book.wordCountDisplay || 0
    })
    return Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      ...stats
    }))
  })

  // 按平台统计
  const platformStats = computed(() => {
    const platformMap: Record<string, { count: number; totalWords: number }> = {}
    bookStore.books.forEach((book) => {
      const platform = book.platform || '未知平台'
      if (!platformMap[platform]) {
        platformMap[platform] = { count: 0, totalWords: 0 }
      }
      platformMap[platform].count++
      platformMap[platform].totalWords += book.wordCountDisplay || 0
    })
    return Object.entries(platformMap).map(([platform, stats]) => ({
      platform,
      ...stats
    }))
  })

  // 按阅读状态统计
  const statusStats = computed(() => {
    return bookStore.booksByStatus
  })

  // 月度统计（按创建时间）
  const monthlyStats = computed(() => {
    const monthMap: Record<string, { booksAdded: number; totalWords: number }> = {}
    bookStore.books.forEach((book) => {
      const date = new Date(book.createdAt)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthMap[month]) {
        monthMap[month] = { booksAdded: 0, totalWords: 0 }
      }
      monthMap[month].booksAdded++
      monthMap[month].totalWords += book.wordCountDisplay || 0
    })
    return Object.entries(monthMap)
      .map(([month, stats]) => ({
        month,
        ...stats
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
  })

  return {
    // Getters
    totalBooks,
    totalWordCount,
    finishedBooks,
    readingBooks,
    unreadBooks,
    averageRating,
    categoryStats,
    platformStats,
    statusStats,
    monthlyStats
  }
})

