import { ElectronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchDetail, SearchResult, TagInput } from '../renderer/src/types/book'
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
      }
      stats: {
        getOverview: () => Promise<ApiResponse>
        getCategoryStats: () => Promise<ApiResponse>
        getPlatformStats: () => Promise<ApiResponse>
        getStatusStats: () => Promise<ApiResponse>
        getMonthlyStats: (months?: number) => Promise<ApiResponse>
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
    }
  }
}
