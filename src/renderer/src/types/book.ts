/**
 * 书籍相关类型定义
 */

export interface Book {
  id: number
  title: string
  author?: string
  coverUrl?: string
  platform?: string
  category?: string
  description?: string
  wordCountSource: 'search' | 'document' | 'manual'
  wordCountSearch?: number
  wordCountDocument?: number
  wordCountManual?: number
  wordCountDisplay?: number
  isbn?: string
  sourceUrl?: string
  readingStatus: 'unread' | 'reading' | 'finished' | 'dropped' | 'to-read'
  personalRating?: number
  tags?: Tag[]
  createdAt: string
  updatedAt: string
}

export interface BookInput {
  title: string
  author?: string
  coverUrl?: string
  platform?: string
  category?: string
  description?: string
  wordCountDisplay?: number
  wordCountSource?: 'search' | 'document' | 'manual'
  wordCountSearch?: number
  wordCountDocument?: number
  wordCountManual?: number
  isbn?: string
  sourceUrl?: string
  readingStatus?: string
  personalRating?: number
}

export interface Document {
  id: number
  bookId: number
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  wordCount?: number
  uploadedAt: string
}

export interface SearchResult {
  title: string
  author: string
  cover: string
  platform?: string
  category?: string
  wordCount: number
  description: string
  sourceUrl: string
}

export interface SearchDetail {
  platform?: string
  category?: string
}

export interface Note {
  id: number
  bookId: number
  noteType: 'review' | 'note' | 'excerpt'
  content: string
  createdAt: string
}

export interface NoteInput {
  bookId: number
  noteType: 'review' | 'note' | 'excerpt'
  content: string
}

export interface Tag {
  id: number
  tagName: string
  color?: string
  createdAt: string
}

export interface TagInput {
  tagName: string
  color?: string
}

export interface ReadingProgress {
  id: number
  bookId: number
  currentChapter?: string
  currentPage?: number
  progressPercentage?: number
  lastReadAt?: string
}

export interface ReadingProgressInput {
  bookId: number
  currentChapter?: string
  currentPage?: number
  progressPercentage?: number
  lastReadAt?: string
}

export interface DocumentInput {
  bookId: number
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  wordCount?: number
}

/**
 * 分页查询筛选条件
 */
export interface BookFilters {
  readingStatus?: string | null
  category?: string | null
  platform?: string | null
  tagIds?: number[]
  keyword?: string
}

/**
 * 排序选项
 */
export interface BookSort {
  sortBy?: 'wordCount' | 'createdAt' | 'rating' | 'title' | 'author' | null
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

