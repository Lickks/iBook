/**
 * 书籍相关 API
 */

import type { Book, BookInput } from '../types'

/**
 * 获取所有书籍
 */
export async function getAllBooks(): Promise<Book[]> {
  // TODO: 调用 Electron IPC
  return []
}

/**
 * 根据ID获取书籍
 */
export async function getBookById(id: number): Promise<Book | null> {
  // TODO: 调用 Electron IPC
  return null
}

/**
 * 创建书籍
 */
export async function createBook(book: BookInput): Promise<Book> {
  // TODO: 调用 Electron IPC
  throw new Error('Not implemented')
}

/**
 * 更新书籍
 */
export async function updateBook(id: number, book: Partial<BookInput>): Promise<Book> {
  // TODO: 调用 Electron IPC
  throw new Error('Not implemented')
}

/**
 * 删除书籍
 */
export async function deleteBook(id: number): Promise<boolean> {
  // TODO: 调用 Electron IPC
  return false
}

/**
 * 搜索书籍
 */
export async function searchBooks(keyword: string): Promise<Book[]> {
  // TODO: 调用 Electron IPC
  return []
}

