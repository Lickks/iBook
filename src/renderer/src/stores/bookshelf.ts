import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Bookshelf, BookshelfInput } from '../types/bookshelf'
import * as bookshelfAPI from '../api/bookshelf'

/**
 * 书架状态管理 Store
 */
export const useBookshelfStore = defineStore('bookshelf', () => {
  // State
  const bookshelves = ref<Bookshelf[]>([])
  const currentBookshelfId = ref<number | null>(null)
  const loading = ref(false)

  // Getters
  const currentBookshelf = computed(() => {
    if (currentBookshelfId.value === null) {
      // 返回默认书架
      return bookshelves.value.find(bs => bs.isDefault) || null
    }
    return bookshelves.value.find(bs => bs.id === currentBookshelfId.value) || null
  })

  const defaultBookshelf = computed(() => {
    return bookshelves.value.find(bs => bs.isDefault) || null
  })

  const customBookshelves = computed(() => {
    return bookshelves.value.filter(bs => !bs.isDefault)
  })

  // Actions
  /**
   * 获取所有书架
   */
  async function fetchBookshelves(): Promise<void> {
    loading.value = true
    try {
      bookshelves.value = await bookshelfAPI.getAllBookshelves()
      // 如果没有当前书架，设置为默认书架
      if (currentBookshelfId.value === null && defaultBookshelf.value) {
        currentBookshelfId.value = defaultBookshelf.value.id
      }
    } catch (error: any) {
      console.error('获取书架列表失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建书架
   */
  async function createBookshelf(name: string, description?: string): Promise<Bookshelf> {
    loading.value = true
    try {
      const bookshelf = await bookshelfAPI.createBookshelf(name, description)
      bookshelves.value.push(bookshelf)
      return bookshelf
    } catch (error: any) {
      console.error('创建书架失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新书架
   */
  async function updateBookshelf(id: number, input: Partial<BookshelfInput>): Promise<Bookshelf> {
    loading.value = true
    try {
      const bookshelf = await bookshelfAPI.updateBookshelf(id, input)
      const index = bookshelves.value.findIndex((bs) => bs.id === id)
      if (index !== -1) {
        bookshelves.value[index] = bookshelf
      }
      return bookshelf
    } catch (error: any) {
      console.error('更新书架失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除书架
   */
  async function deleteBookshelf(id: number): Promise<void> {
    loading.value = true
    try {
      await bookshelfAPI.deleteBookshelf(id)
      const index = bookshelves.value.findIndex((bs) => bs.id === id)
      if (index !== -1) {
        bookshelves.value.splice(index, 1)
      }
      // 如果删除的是当前书架，切换到默认书架
      if (currentBookshelfId.value === id && defaultBookshelf.value) {
        currentBookshelfId.value = defaultBookshelf.value.id
      }
    } catch (error: any) {
      console.error('删除书架失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 设置当前书架
   */
  function setCurrentBookshelf(id: number | null): void {
    currentBookshelfId.value = id
  }

  /**
   * 添加书籍到书架
   */
  async function addBooksToBookshelf(bookshelfId: number, bookIds: number[]): Promise<number> {
    try {
      return await bookshelfAPI.addBooksToBookshelf(bookshelfId, bookIds)
    } catch (error: any) {
      console.error('添加书籍到书架失败:', error)
      throw error
    }
  }

  /**
   * 从书架移除书籍
   */
  async function removeBooksFromBookshelf(bookshelfId: number, bookIds: number[]): Promise<number> {
    try {
      return await bookshelfAPI.removeBooksFromBookshelf(bookshelfId, bookIds)
    } catch (error: any) {
      console.error('从书架移除书籍失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取书架
   */
  function getBookshelfById(id: number): Bookshelf | undefined {
    return bookshelves.value.find((bs) => bs.id === id)
  }

  return {
    // State
    bookshelves,
    currentBookshelfId,
    loading,
    // Getters
    currentBookshelf,
    defaultBookshelf,
    customBookshelves,
    // Actions
    fetchBookshelves,
    createBookshelf,
    updateBookshelf,
    deleteBookshelf,
    setCurrentBookshelf,
    addBooksToBookshelf,
    removeBooksFromBookshelf,
    getBookshelfById
  }
})

