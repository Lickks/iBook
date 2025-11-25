import type { Bookshelf, BookshelfInput, BookshelfStats } from '../types/bookshelf'
import type { Book, BookFilters } from '../types/book'
import type { ApiResponse } from '../types/api'

/**
 * 创建书架
 */
export async function createBookshelf(name: string, description?: string): Promise<Bookshelf> {
  const response = (await window.api.bookshelf.create(name, description)) as ApiResponse<Bookshelf>
  if (!response.success) {
    throw new Error(response.error || '创建书架失败')
  }
  return response.data!
}

/**
 * 更新书架
 */
export async function updateBookshelf(id: number, input: Partial<BookshelfInput>): Promise<Bookshelf> {
  const response = (await window.api.bookshelf.update(id, input)) as ApiResponse<Bookshelf>
  if (!response.success) {
    throw new Error(response.error || '更新书架失败')
  }
  return response.data!
}

/**
 * 删除书架
 */
export async function deleteBookshelf(id: number): Promise<boolean> {
  const response = (await window.api.bookshelf.delete(id)) as ApiResponse
  if (!response.success) {
    throw new Error(response.error || '删除书架失败')
  }
  return true
}

/**
 * 获取所有书架
 */
export async function getAllBookshelves(): Promise<Bookshelf[]> {
  const response = (await window.api.bookshelf.getAll()) as ApiResponse<Bookshelf[]>
  if (!response.success) {
    throw new Error(response.error || '获取书架列表失败')
  }
  return response.data || []
}

/**
 * 根据ID获取书架
 */
export async function getBookshelfById(id: number): Promise<Bookshelf | null> {
  const response = (await window.api.bookshelf.getById(id)) as ApiResponse<Bookshelf>
  if (!response.success) {
    throw new Error(response.error || '获取书架失败')
  }
  return response.data || null
}

/**
 * 添加书籍到书架
 */
export async function addBooksToBookshelf(bookshelfId: number, bookIds: number[]): Promise<number> {
  // 确保 bookIds 是纯数组，避免序列化问题
  const ids = Array.isArray(bookIds) ? [...bookIds] : []
  const response = (await window.api.bookshelf.addBooks(bookshelfId, ids)) as ApiResponse<{ count: number }>
  if (!response.success) {
    throw new Error(response.error || '添加书籍到书架失败')
  }
  return response.data?.count || 0
}

/**
 * 从书架移除书籍
 */
export async function removeBooksFromBookshelf(bookshelfId: number, bookIds: number[]): Promise<number> {
  // 确保 bookIds 是纯数组，避免序列化问题
  const ids = Array.isArray(bookIds) ? [...bookIds] : []
  const response = (await window.api.bookshelf.removeBooks(bookshelfId, ids)) as ApiResponse<{ count: number }>
  if (!response.success) {
    throw new Error(response.error || '从书架移除书籍失败')
  }
  return response.data?.count || 0
}

/**
 * 获取书架中的书籍
 */
export async function getBooksInBookshelf(bookshelfId: number | null, filters?: BookFilters): Promise<Book[]> {
  const response = (await window.api.bookshelf.getBooks(bookshelfId, filters)) as ApiResponse<Book[]>
  if (!response.success) {
    throw new Error(response.error || '获取书架书籍失败')
  }
  return response.data || []
}

/**
 * 获取书架统计信息
 */
export async function getBookshelfStats(bookshelfId: number): Promise<BookshelfStats> {
  const response = (await window.api.bookshelf.getStats(bookshelfId)) as ApiResponse<BookshelfStats>
  if (!response.success) {
    throw new Error(response.error || '获取书架统计失败')
  }
  return response.data!
}

/**
 * 获取书籍所属的书架列表
 */
export async function getBookshelvesByBookId(bookId: number): Promise<Bookshelf[]> {
  const response = (await window.api.bookshelf.getByBookId(bookId)) as ApiResponse<Bookshelf[]>
  if (!response.success) {
    throw new Error(response.error || '获取书籍所属书架失败')
  }
  return response.data || []
}

