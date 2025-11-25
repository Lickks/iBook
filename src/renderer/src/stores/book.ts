import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { READING_STATUS } from '../constants'
import type { Book, BookInput } from '../types'
import * as bookAPI from '../api/book'
import * as tagAPI from '../api/tag'

/**
 * 书籍状态管理 Store
 */
export const useBookStore = defineStore('book', () => {
  // State
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const loading = ref(false)
  const searchKeyword = ref('')
  const selectedStatus = ref<string | null>(null)
  const selectedCategory = ref<string | null>(null)
  const selectedPlatform = ref<string | null>(null)
  const selectedTags = ref<number[]>([])
  const sortBy = ref<'wordCount' | 'createdAt' | 'rating' | 'title' | 'author' | null>(null)
  const sortOrder = ref<'asc' | 'desc'>('desc')

  // Getters
  const filteredBooks = computed(() => {
    let result = books.value

    // 按搜索关键词筛选
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(keyword) ||
          book.author?.toLowerCase().includes(keyword) ||
          book.description?.toLowerCase().includes(keyword)
      )
    }

    // 按阅读状态筛选
    if (selectedStatus.value) {
      result = result.filter(book => book.readingStatus === selectedStatus.value)
    }

    // 按类型筛选
    if (selectedCategory.value) {
      result = result.filter(book => book.category === selectedCategory.value)
    }

    // 按平台筛选
    if (selectedPlatform.value) {
      result = result.filter(book => book.platform === selectedPlatform.value)
    }

    // 按标签筛选
    if (selectedTags.value.length > 0) {
      result = result.filter(book => {
        const bookTagIds = book.tags?.map(tag => tag.id) || []
        return selectedTags.value.some(tagId => bookTagIds.includes(tagId))
      })
    }

    // 排序
    if (sortBy.value) {
      result = [...result].sort((a, b) => {
        let aValue: any
        let bValue: any
        let aSecondary: any
        let bSecondary: any

        switch (sortBy.value) {
          case 'wordCount':
            aValue = a.wordCountDisplay || 0
            bValue = b.wordCountDisplay || 0
            // 字数相同时按书名排序
            aSecondary = a.title.toLowerCase()
            bSecondary = b.title.toLowerCase()
            break
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            // 时间相同时按书名排序
            aSecondary = a.title.toLowerCase()
            bSecondary = b.title.toLowerCase()
            break
          case 'rating':
            aValue = a.personalRating || 0
            bValue = b.personalRating || 0
            // 评分相同时按书名排序
            aSecondary = a.title.toLowerCase()
            bSecondary = b.title.toLowerCase()
            break
          case 'title':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'author':
            // 按作者排序，空作者统一处理为"未知作者"
            aValue = (a.author || '未知作者').toLowerCase()
            bValue = (b.author || '未知作者').toLowerCase()
            // 相同作者时按书名排序
            aSecondary = a.title.toLowerCase()
            bSecondary = b.title.toLowerCase()
            break
          default:
            return 0
        }

        // 主排序
        if (aValue < bValue) {
          return sortOrder.value === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortOrder.value === 'asc' ? 1 : -1
        }
        
        // 主排序值相同时，使用次要排序（如果存在）
        if (aSecondary !== undefined && bSecondary !== undefined) {
          if (aSecondary < bSecondary) return sortOrder.value === 'asc' ? -1 : 1
          if (aSecondary > bSecondary) return sortOrder.value === 'asc' ? 1 : -1
        }
        
        return 0
      })
    }

    return result
  })

  const totalWordCount = computed(() => {
    return books.value.reduce((sum, book) => {
      return sum + (book.wordCountDisplay || 0)
    }, 0)
  })

  const booksByStatus = computed(() => {
    const statusMap: Record<string, Book[]> = {
      unread: [],
      reading: [],
      finished: [],
      dropped: [],
      'to-read': []
    }
    books.value.forEach((book) => {
      const status = book.readingStatus || 'unread'
      if (statusMap[status]) {
        statusMap[status].push(book)
      }
    })
    return statusMap
  })

  // 状态统计
  const statusStats = computed(() => {
    const stats = {
      all: books.value.length,
      [READING_STATUS.UNREAD]: 0,
      [READING_STATUS.READING]: 0,
      [READING_STATUS.FINISHED]: 0,
      [READING_STATUS.DROPPED]: 0,
      [READING_STATUS.TO_READ]: 0
    }

    books.value.forEach(book => {
      const status = book.readingStatus || READING_STATUS.UNREAD
      if (status in stats) {
        stats[status as keyof typeof stats]++
      }
    })

    return stats
  })

  // 检查是否有筛选条件
  const hasActiveFilters = computed(() => {
    return (
      searchKeyword.value.trim() !== '' ||
      selectedStatus.value !== null ||
      selectedCategory.value !== null ||
      selectedPlatform.value !== null ||
      selectedTags.value.length > 0
    )
  })

  // 获取所有可用的类型和平台
  const availableCategories = computed(() => {
    const categories = new Set<string>()
    books.value.forEach(book => {
      if (book.category) {
        categories.add(book.category)
      }
    })
    return Array.from(categories).sort()
  })

  const availablePlatforms = computed(() => {
    const platforms = new Set<string>()
    books.value.forEach(book => {
      if (book.platform) {
        platforms.add(book.platform)
      }
    })
    return Array.from(platforms).sort()
  })

  // Actions
  /**
   * 获取所有书籍
   */
  async function fetchBooks(): Promise<void> {
    loading.value = true
    try {
      books.value = await bookAPI.getAllBooks()
    } catch (error: any) {
      console.error('获取书籍列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据ID获取书籍
   */
  async function fetchBookById(id: number): Promise<void> {
    loading.value = true
    try {
      const book = await bookAPI.getBookById(id)
      currentBook.value = book
      // 如果书籍不在列表中，添加到列表
      if (book && !books.value.find((b) => b.id === book.id)) {
        books.value.push(book)
      }
    } catch (error: any) {
      console.error('获取书籍失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建书籍
   */
  async function createBook(input: BookInput): Promise<Book> {
    loading.value = true
    try {
      const book = await bookAPI.createBook(input)
      books.value.unshift(book) // 添加到列表开头
      return book
    } catch (error: any) {
      console.error('创建书籍失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新书籍
   */
  async function updateBook(id: number, input: Partial<BookInput>): Promise<Book> {
    loading.value = true
    try {
      const book = await bookAPI.updateBook(id, input)
      // 更新列表中的书籍
      const index = books.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        books.value[index] = book
      }
      // 如果当前书籍被更新，也更新 currentBook
      if (currentBook.value?.id === id) {
        currentBook.value = book
      }
      return book
    } catch (error: any) {
      console.error('更新书籍失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除书籍
   */
  async function deleteBook(id: number): Promise<void> {
    loading.value = true
    try {
      await bookAPI.deleteBook(id)
      // 从列表中移除
      books.value = books.value.filter((b) => b.id !== id)
      // 如果删除的是当前书籍，清空 currentBook
      if (currentBook.value?.id === id) {
        currentBook.value = null
      }
    } catch (error: any) {
      console.error('删除书籍失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  
  /**
   * 搜索书籍
   */
  async function searchBooks(keyword: string): Promise<void> {
    searchKeyword.value = keyword
    loading.value = true
    try {
      if (!keyword.trim()) {
        await fetchBooks()
        return
      }
      books.value = await bookAPI.searchBooks(keyword)
    } catch (error: any) {
      console.error('搜索书籍失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置搜索关键词
   */
  function setSearchKeyword(keyword: string): void {
    searchKeyword.value = keyword
  }

  /**
   * 清空搜索
   */
  function clearSearch(): void {
    searchKeyword.value = ''
    fetchBooks()
  }

  /**
   * 设置当前书籍
   */
  function setCurrentBook(book: Book | null): void {
    currentBook.value = book
  }

  /**
   * 设置筛选状态
   */
  function setSelectedStatus(status: string | null): void {
    selectedStatus.value = status
  }

  /**
   * 清空所有筛选条件
   */
  function clearAllFilters(): void {
    searchKeyword.value = ''
    selectedStatus.value = null
    selectedCategory.value = null
    selectedPlatform.value = null
    selectedTags.value = []
    sortBy.value = null
    sortOrder.value = 'desc'
    fetchBooks()
  }

  /**
   * 设置筛选类型
   */
  function setSelectedCategory(category: string | null): void {
    selectedCategory.value = category
  }

  /**
   * 设置筛选平台
   */
  function setSelectedPlatform(platform: string | null): void {
    selectedPlatform.value = platform
  }

  /**
   * 设置筛选标签
   */
  function setSelectedTags(tagIds: number[]): void {
    selectedTags.value = tagIds
  }

  /**
   * 切换标签筛选
   */
  function toggleTagFilter(tagId: number): void {
    const index = selectedTags.value.indexOf(tagId)
    if (index === -1) {
      selectedTags.value = [...selectedTags.value, tagId]
    } else {
      selectedTags.value = selectedTags.value.filter(id => id !== tagId)
    }
  }

  /**
   * 设置排序
   */
  function setSort(sort: 'wordCount' | 'createdAt' | 'rating' | 'title' | 'author' | null, order: 'asc' | 'desc' = 'desc'): void {
    sortBy.value = sort
    sortOrder.value = order
  }

  /**
   * 批量更新书籍状态
   */
  async function batchUpdateStatus(bookIds: number[], status: string): Promise<void> {
    loading.value = true
    try {
      const updatePromises = bookIds.map(id =>
        bookAPI.updateBook(id, { readingStatus: status })
      )

      const updatedBooks = await Promise.all(updatePromises)

      // 更新本地状态
      updatedBooks.forEach(book => {
        const index = books.value.findIndex(b => b.id === book.id)
        if (index !== -1) {
          books.value[index] = book
        }
      })

      return updatedBooks
    } catch (error: any) {
      console.error('批量更新状态失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量删除书籍
   */
  async function batchDeleteBooks(bookIds: number[]): Promise<number> {
    loading.value = true
    try {
      const count = await bookAPI.deleteBatch(bookIds)
      // 从本地状态中移除已删除的书籍
      books.value = books.value.filter(book => !bookIds.includes(book.id))
      return count
    } catch (error: any) {
      console.error('批量删除失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量添加标签
   */
  async function batchAddTags(bookIds: number[], tagIds: number[]): Promise<void> {
    loading.value = true
    try {
      const promises: Promise<number>[] = []
      for (const tagId of tagIds) {
        promises.push(tagAPI.batchAddTagToBooks(bookIds, tagId))
      }
      await Promise.all(promises)
      // 刷新书籍列表以获取最新的标签信息
      await fetchBooks()
    } catch (error: any) {
      console.error('批量添加标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    books,
    currentBook,
    loading,
    searchKeyword,
    selectedStatus,
    selectedCategory,
    selectedPlatform,
    selectedTags,
    sortBy,
    sortOrder,
    // Getters
    filteredBooks,
    totalWordCount,
    booksByStatus,
    statusStats,
    hasActiveFilters,
    availableCategories,
    availablePlatforms,
    // Actions
    fetchBooks,
    fetchBookById,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    setSearchKeyword,
    clearSearch,
    setCurrentBook,
    setSelectedStatus,
    clearAllFilters,
    batchUpdateStatus,
    setSelectedCategory,
    setSelectedPlatform,
    setSelectedTags,
    toggleTagFilter,
    setSort,
    batchDeleteBooks,
    batchAddTags
  }
})