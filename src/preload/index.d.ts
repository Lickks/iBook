import { ElectronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchDetail, SearchResult, TagInput } from '../renderer/src/types/book'
import type { BookshelfInput } from '../renderer/src/types/bookshelf'
import type { ApiResponse } from '../renderer/src/types/api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      book: {
        create: (input: BookInput) => Promise<ApiResponse>
        update: (id: number, input: Partial<BookInput>) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        deleteBatch: (ids: number[]) => Promise<ApiResponse>
        getById: (id: number) => Promise<ApiResponse>
        getAll: () => Promise<ApiResponse>
        search: (keyword: string) => Promise<ApiResponse>
        getPaginated: (page: number, pageSize: number, filters?: any, sort?: any) => Promise<ApiResponse>
      }
      document: {
        selectFile: () => Promise<ApiResponse<string>>
        selectFiles: () => Promise<ApiResponse<string[]>>
        upload: (filePath: string, bookId: number) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        open: (fileName: string) => Promise<ApiResponse>
        countWords: (fileName: string) => Promise<ApiResponse<number>>
        getByBookId: (bookId: number) => Promise<ApiResponse>
        update: (id: number, input: Partial<DocumentInput>) => Promise<ApiResponse>
      }
      search: {
        youshu: (keyword: string) => Promise<ApiResponse<SearchResult[]>>
        detail: (sourceUrl: string) => Promise<ApiResponse<SearchDetail>>
        downloadCover: (url: string, title?: string) => Promise<ApiResponse<string>>
        batchSearch: (keywords: string[]) => Promise<ApiResponse>
      }
      ebook: {
        extractCover: (filePath: string) => Promise<ApiResponse<string | null>>
      }
      stats: {
        getOverview: (bookshelfId?: number | null) => Promise<ApiResponse>
        getCategoryStats: (bookshelfId?: number | null) => Promise<ApiResponse>
        getPlatformStats: (bookshelfId?: number | null) => Promise<ApiResponse>
        getStatusStats: (bookshelfId?: number | null) => Promise<ApiResponse>
        getMonthlyStats: (months?: number, bookshelfId?: number | null) => Promise<ApiResponse>
        getYearlyStats: (year: number) => Promise<ApiResponse>
        recalculateStats: () => Promise<ApiResponse>
      }
      tag: {
        create: (input: TagInput) => Promise<ApiResponse>
        update: (id: number, input: Partial<TagInput>) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        getAll: () => Promise<ApiResponse>
        getById: (id: number) => Promise<ApiResponse>
        addToBook: (bookId: number, tagId: number) => Promise<ApiResponse>
        removeFromBook: (bookId: number, tagId: number) => Promise<ApiResponse>
        getByBookId: (bookId: number) => Promise<ApiResponse>
        batchAddToBooks: (bookIds: number[], tagId: number) => Promise<ApiResponse>
        getUsageCount: (tagId: number) => Promise<ApiResponse<number>>
      }
      bookshelf: {
        create: (name: string, description?: string) => Promise<ApiResponse>
        update: (id: number, input: Partial<BookshelfInput>) => Promise<ApiResponse>
        delete: (id: number) => Promise<ApiResponse>
        getAll: () => Promise<ApiResponse>
        getById: (id: number) => Promise<ApiResponse>
        addBooks: (bookshelfId: number, bookIds: number[]) => Promise<ApiResponse>
        removeBooks: (bookshelfId: number, bookIds: number[]) => Promise<ApiResponse>
        getBooks: (bookshelfId: number | null, filters?: any) => Promise<ApiResponse>
        getStats: (bookshelfId: number) => Promise<ApiResponse>
        getByBookId: (bookId: number) => Promise<ApiResponse>
      }
      backup: {
        create: (savePath?: string) => Promise<ApiResponse<{ path?: string }>>
        restore: (backupPath?: string) => Promise<ApiResponse>
        validate: (backupPath: string) => Promise<ApiResponse<{ valid: boolean; metadata?: any; error?: string }>>
        getInfo: (backupPath: string) => Promise<ApiResponse>
        onProgress: (callback: (progress: any) => void) => () => void
        onRestoreProgress: (callback: (progress: any) => void) => () => void
        onRestoreComplete: (callback: () => void) => () => void
      }
      updater: {
        check: () => Promise<ApiResponse>
        quitAndInstall: () => Promise<ApiResponse>
        onStatus: (callback: (status: { status: string; data?: any }) => void) => () => void
      }
    }
  }
}
