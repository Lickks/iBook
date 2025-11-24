import { ElectronAPI } from '@electron-toolkit/preload'
import type { BookInput, DocumentInput, SearchDetail, SearchResult } from '../renderer/src/types/book'
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
    }
  }
}
