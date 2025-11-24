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
  platform: string
  wordCount: number
  description: string
  sourceUrl: string
}

