/**
 * 书籍相关 API
 */

import type { Book, BookInput } from '../types'
import type { ApiResponse } from '../types/api'

/**
 * 获取所有书籍
 */
export async function getAllBooks(): Promise<Book[]> {
  const response = await window.api.book.getAll()
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '获取书籍列表失败')
}

/**
 * 根据ID获取书籍
 */
export async function getBookById(id: number): Promise<Book | null> {
  const response = await window.api.book.getById(id)
  if (response.success && response.data) {
    return response.data
  }
  if (response.error === '书籍不存在') {
    return null
  }
  throw new Error(response.error || '获取书籍失败')
}

/**
 * 创建书籍
 */
export async function createBook(book: BookInput): Promise<Book> {
  const response = await window.api.book.create(book)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '创建书籍失败')
}

/**
 * 更新书籍
 */
export async function updateBook(id: number, book: Partial<BookInput>): Promise<Book> {
  const response = await window.api.book.update(id, book)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '更新书籍失败')
}

/**
 * 删除书籍
 */
export async function deleteBook(id: number): Promise<boolean> {
  const response = await window.api.book.delete(id)
  if (response.success) {
    return true
  }
  throw new Error(response.error || '删除书籍失败')
}

/**
 * 批量删除书籍
 */
export async function deleteBooks(ids: number[]): Promise<boolean> {
  const response = await window.api.book.deleteBatch(ids)
  if (response.success) {
    return true
  }
  throw new Error(response.error || '批量删除书籍失败')
}

/**
 * 搜索书籍
 */
export async function searchBooks(keyword: string): Promise<Book[]> {
  const response = await window.api.book.search(keyword)
  if (response.success && response.data) {
    return response.data
  }
  throw new Error(response.error || '搜索书籍失败')
}

