/**
 * 书架相关类型定义
 */

export interface Bookshelf {
  id: number
  name: string
  description?: string
  isDefault: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface BookshelfInput {
  name: string
  description?: string
  sortOrder?: number
}

export interface BookshelfStats {
  totalBooks: number
  finishedBooks: number
  readingBooks: number
  toReadBooks: number
  droppedBooks: number
  totalWords: number
  avgRating: number | null
}

